import axios, { AxiosResponse } from "axios";
import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import { WebSocket, WebSocketServer } from "ws";
import { VlcMediaStatus } from "../../domain/vlc-media-status";
import { ViewProgressService } from "./view-progress-service";
import { VlcPlaylist, VlcPlaylistItem } from "../../domain/vlc-playlist";

const autorunVlc = process.env.AUTORUN_VLC === "true";
const vlcTarget = "http://localhost:8080";

export const VlcService = (webSocketServer: WebSocketServer, viewProgressService: ViewProgressService) => {
  if (autorunVlc) {
    startVlc()
      .then(focusVlc)
      .then(() => startPollingStatus(webSocketServer, viewProgressService))
      .catch(console.error);
  } else {
    startPollingStatus(webSocketServer, viewProgressService);
  }

  return {
    runVlcCommand: async (
      command: string
    ): Promise<AxiosResponse<VlcMediaStatus>> => {
      const url = `${vlcTarget}/${command}`;

      console.log(`OUT GET ${url}`);
      const response = await axios.get(url, {
        insecureHTTPParser: true,
        validateStatus: () => true,
        auth: {
          username: "",
          password: "mats",
        },
      });

      return response;
    },
  };
};

function startVlc(): Promise<ChildProcessWithoutNullStreams> {
  return new Promise((resolve, reject) => {
    const process = spawn("vlc", [
      "--extraintf=luaintf",
      "--lua-intf=http",
      "--http-password=mats",
    ]);
    process.stdout.on("data", (data) => console.log(`stdout: ${data}`));
    process.stderr.on("data", (data) => console.error(`stderr: ${data}`));
    process.on("spawn", () => resolve(process));
    process.on("error", () => reject());

    process.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      reject();
    });
  });
}

async function startPollingStatus(wss: WebSocketServer, viewProgressService: ViewProgressService) {
  const url = `${vlcTarget}/requests/status.json`;
  console.log(`OUT GET ${url}`);
  const response: AxiosResponse<VlcMediaStatus> = await axios.get(url, {
    insecureHTTPParser: true,
    validateStatus: () => true,
    auth: {
      username: "",
      password: "mats",
    },
  });

  if (response.status !== 200) {
    console.error(response.status, response.data);
    setTimeout(() => startPollingStatus(wss, viewProgressService), 1000);
    return;
  }

  const vlcMediaStatus = response.data;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(vlcMediaStatus));
    }
  });

  const filename = vlcMediaStatus.information?.category.meta.filename;

  if (vlcMediaStatus?.state === "playing" && filename) {
    const item = await getVlcPlaylistItem(filename);
    const parentFolder = item?.uri.split("/").slice(2, -1).join("/")
    if (parentFolder) {
      viewProgressService.saveProgress(parentFolder, {
        position: vlcMediaStatus.position,
        filename: filename,
      });
    }
  }

  setTimeout(() => startPollingStatus(wss, viewProgressService), 1000);
}

function focusVlc() {
  exec("wmctrl -a 'VLC media player'", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

async function getVlcPlaylistItem(
  filename: string
): Promise<VlcPlaylistItem | undefined> {
  const url = `${vlcTarget}/requests/playlist.json`;
  console.log(`OUT GET ${url}`);
  const response = await axios.get<VlcPlaylist>(url, {
    insecureHTTPParser: true,
    validateStatus: () => true,
    auth: {
      username: "",
      password: "mats",
    },
  });

  if (response.status !== 200) {
    console.error(response.status, response.data);
    return undefined;
  }

  return response.data.children[0].children
    .filter((c) => c.type === "leaf")
    .find((c) => c.name === filename);
}
