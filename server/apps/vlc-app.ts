import axios, { AxiosResponse } from "axios";
import chalk from "chalk";
import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import {
  defer,
  interval,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from "rxjs";
import { WebSocketServer } from "ws";
import {
  TrackedVlcMediaStatus,
  VlcMediaStatus,
} from "../../domain/vlc-media-status";
import { VlcPlaylist, VlcPlaylistItem } from "../../domain/vlc-playlist";
import {
  VlcStatusWebsocketEvent,
  WebsocketEvent,
} from "../../domain/websocket";
import { BaseApp } from "../app-manager";
import { logger, vlcLogger } from "../logger";
import { MEDIA_ROOT, relativeMediaRoot } from "../service/media-web-service";
import { ViewProgressService } from "../service/view-progress-service";
import { WebSocketComs } from "../service/web-socket-coms";
import { Program } from "../os/program";

export const vlcTarget = "http://localhost:8080";

export interface VlcApp extends BaseApp {
  type: "vlc";
  runCommand: <T>(command: string) => Promise<AxiosResponse<T>>;
}

export const VlcApp = (
  wss: WebSocketServer,
  viewProgressService: ViewProgressService
): VlcApp => {
  let vlcProcess: ChildProcessWithoutNullStreams | undefined;
  let statusUpdates: Subscription | undefined;

  const checkStatus = createVlcObserver(viewProgressService);

  return {
    type: "vlc",
    startApp: async () => {
      if (!vlcProcess) {
        vlcProcess = await startVlcProcess();
      }
      statusUpdates = checkStatus.subscribe(WebSocketComs.broadcaster(wss));
    },
    pauseApp: async () => {
      statusUpdates?.unsubscribe();
      await runVlcCommand("status.json?command=pl_forcepause");
    },
    runCommand: runVlcCommand,
  };
};

async function startVlcProcess(): Promise<ChildProcessWithoutNullStreams> {
  return new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
    const process = spawn("vlc", [
      "--extraintf=luaintf",
      "--lua-intf=http",
      "--http-password=mats",
    ]);
    process.stdout.on("data", (data) => {
      vlcLogger.info(data);
      if (hasStarted(data)) resolve(process);
    });
    process.stderr.on("data", (data) => {
      vlcLogger.error(data);
      if (hasStarted(data)) resolve(process);
    });
    process.on("error", (e) => {
      logger.error(e);
      reject(e);
    });

    process.on("close", (code) => {
      logger.info(`VLC exited with code: ${code}`);
    });

    function hasStarted(data: string): boolean {
      return data.indexOf("Running vlc") !== -1;
    }
  }).then((e) => {
    return Program.bringToFront("VLC Media Player")
      .then(() => e)
      .catch((e) => {
        logger.error(e);
        return e;
      });
  });
}

async function runVlcCommand<T>(operation: string): Promise<AxiosResponse<T>> {
  operation = operation
    .replace("in_enqueue&input=", `in_enqueue&input=${MEDIA_ROOT}/`)
    .replace("in_play&id=", `in_play&id=${MEDIA_ROOT}/`)
    .replace("in_play&input=", `in_play&input=${MEDIA_ROOT}/`);

  const url = `${vlcTarget}/requests/${operation}`;

  logger.debug(chalk.gray(`GET ${url}`));
  const response = await axios.get(url, {
    insecureHTTPParser: true,
    validateStatus: () => true,
    auth: {
      username: "",
      password: "mats",
    },
  });

  return response;
}

export const getPlaylistItem = async (
  name: string
): Promise<VlcPlaylistItem | undefined> => {
  const playlist = await runVlcCommand<VlcPlaylist>("playlist.json");

  if (playlist.status !== 200) {
    logger.error(
      `Unexpected status from VLC ${playlist.status} - ${playlist.data}`
    );
    return undefined;
  }

  return playlist.data.children[0].children
    .filter((c) => c.type === "leaf")
    .find((c) => c.name === name);
};

async function saveProgressIfPlaying(
  status: TrackedVlcMediaStatus,
  viewProgressService: ViewProgressService
) {
  const filename = status.current.information?.category.meta.filename;

  if (status.current?.state === "playing" && filename) {
    const item = await getPlaylistItem(filename);
    const absoluteUri = item?.uri.split("/").slice(2, -1).join("/");
    if (absoluteUri) {
      const relativeUri = relativeMediaRoot(absoluteUri);

      viewProgressService.saveProgress(decodeURIComponent(relativeUri), {
        position: status.current.position,
        filename: filename,
        time: Date.now(),
      });
    }
  }
}

function createVlcObserver(
  viewProgressService: ViewProgressService
): Observable<WebsocketEvent> {
  const vlcStatus = observeVlc();
  let previousStatus: VlcMediaStatus | undefined;

  function observeVlc(): Observable<VlcStatusWebsocketEvent> {
    return interval(1000).pipe(
      switchMap(() =>
        defer(() => runVlcCommand<VlcMediaStatus>("status.json"))
      ),
      map((response) => response.data),
      map<VlcMediaStatus, TrackedVlcMediaStatus>((status) => ({
        current: status,
        prev: previousStatus,
      })),
      tap((result) => (previousStatus = result.current)),
      switchMap((status) =>
        saveProgressIfPlaying(status, viewProgressService).then(() => status)
      ),
      map<TrackedVlcMediaStatus, VlcStatusWebsocketEvent>((status) => ({
        type: "vlc-status",
        data: status,
      }))
    );
  }

  return vlcStatus;
}
