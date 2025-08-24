import { AxiosResponse } from "axios";
import { WebSocketServer } from "ws";
import { VlcMediaStatus } from "../domain/vlc-media-status";
import { YoutubeCommand } from "../domain/youtube";
import { VlcApp } from "./apps/vlc-app";
import { YouTubeApp } from "./apps/youtube-app";
import { GullTvInstaller } from "./installer/gulltv-installer";
import { BrowserService } from "./service/browser-service";
import { MediaFileService } from "./service/media-web-service";
import { ViewProgressService } from "./service/view-progress-service";
import { SystemCommand } from "../domain/system";
import { SystemService } from "./service/system-service";

export type AppType = "vlc" | "youtube";

export interface BaseApp {
  type: AppType;
  startApp: () => Promise<void>;
  pauseApp: () => Promise<void>;
}

export type App = VlcApp | YouTubeApp;

export const AppManager = (wss: WebSocketServer) => {
  let currentApp: App | undefined = undefined;

  const installer = GullTvInstaller();
  installer.install().then();

  const viewProgressService = ViewProgressService();
  const mediaService = MediaFileService(viewProgressService);
  const vlcApp = VlcApp(wss, viewProgressService);

  const browserService = BrowserService();
  const systemService = SystemService();
  const youtubeApp = YouTubeApp(wss, browserService);

  return {
    mediaService,
    youtubeService: youtubeApp,
    onVlcCommand: async (
      command: string
    ): Promise<AxiosResponse<VlcMediaStatus>> => {
      if (currentApp?.type !== "vlc") {
        await currentApp?.pauseApp();
        currentApp = vlcApp;
        await currentApp.startApp();
      }
      return vlcApp.runCommand(command);
    },
    onYoutubeCommand: async (command: YoutubeCommand): Promise<void> => {
      if (currentApp?.type !== "youtube") {
        await currentApp?.pauseApp();
      }
      currentApp = youtubeApp;
      await currentApp.startApp();
      return youtubeApp.runCommand(command);
    },
    onSystemCommand: async (command: SystemCommand): Promise<void> => {
      switch (command.action) {
        case "reboot":
          return systemService.reboot();
        case "restart-service":
          return systemService.restartService();
        default: throw Error("Unknown system command")
      }
    },
  };
};
