import chalk from "chalk";
import {
  defer,
  exhaustMap,
  filter,
  interval,
  map,
  Observable,
  Subscription,
} from "rxjs";
import { WebSocketServer } from "ws";
import {
  WebsocketEvent,
  YoutubeStatusWebsocketEvent,
} from "../../domain/websocket";
import {
  YoutubePlayerStatus,
  YoutubeSearchResponse,
} from "../../domain/youtube";
import { BaseApp } from "../app-manager";
import { logger } from "../logger";
import { Keyboard } from "../os/keyboard";
import { Program } from "../os/program";
import { BrowserService } from "../service/browser-service";
import { WebSocketComs } from "../service/web-socket-coms";
import { Env } from "../environment";

export interface YouTubeApp extends BaseApp {
  type: "youtube";
  search: (query: string) => Promise<YoutubeSearchResponse>;
  runCommand: (command: YoutubeCommand) => Promise<void>;
}

export type YoutubeCommand = {
  action: "play";
  data: string;
};

export const YouTubeApp = (
  wss: WebSocketServer,
  browserService: BrowserService
): YouTubeApp => {
  let statusUpdates: Subscription | undefined;

  const checkStatus = createYoutubeObserver(browserService);

  return {
    type: "youtube",
    search: async (query: string) => {
      const url = y(
        `/youtube/v3/search?key=${Env.youtube.apiKey}&type=video&part=snippet&q=${query}`
      );

      logger.debug(chalk.gray(`GET ${url}`));

      if (Env.production) {
        return fetch(url).then((r) => r.json());
      } else {
        return Promise.resolve(fakeResponse);
      }
    },
    runCommand: async (command: YoutubeCommand) => {
      switch (command.action) {
        case "play":
          const page = browserService.getPage();

          logger.debug(`Playing video ${command.data}`);

          await page.goto(`https://www.youtube.com/watch?v=${command.data}`);
          logger.debug("Waiting for video to load");
          await page.waitForFunction(
            () => (document.querySelector("video")?.readyState || 0) >= 4
          );
          logger.debug(`Video ready: Focus, start and fullscreen`);

          if (Env.production) {
            await Program.bringToFront("Mozilla Firefox");
            await Keyboard.press("Escape");
            await Keyboard.press("k");
            await Keyboard.press("f");
          }
      }
    },
    startApp: async () => {
      logger.info("Start YouTube App");
      await browserService.wake();
      if (!statusUpdates) {
        logger.info("Start YouTube status updates");
        statusUpdates = checkStatus.subscribe({
          next: WebSocketComs.broadcaster(wss),
          error: (error) => {
            logger.error(error);
            statusUpdates = undefined;
          },
        });
      }
    },
    pauseApp: async () => {
      logger.info("Stopp YouTube App");
      statusUpdates?.unsubscribe();
      statusUpdates = undefined;
      const page = browserService.getPage();

      await page.$$eval("video", (e) => {
        const videoTag = e[0];
        if (videoTag) {
          videoTag.pause();
        }
      });
    },
  };
};
export const search = async (query: string) => {};

function y(path: string) {
  return `https://www.googleapis.com${path}`;
}

function createYoutubeObserver(
  browserService: BrowserService
): Observable<WebsocketEvent> {
  const getStatus = async (): Promise<YoutubePlayerStatus | undefined> => {
    logger.debug(`Get status`);
    const page = browserService.getPage();

    await page.waitForFunction(
      () => (document.querySelector("video")?.readyState || 0) >= 3
    );

    const status = await page.$$eval("video", (e) => {
      const video = e[0];
      const status: YoutubePlayerStatus = {
        title: document.title,
        position: Math.round(video?.currentTime ?? 0),
        volume: video?.volume ?? 0,
        state:
          video?.paused === undefined
            ? "stopped"
            : video.paused
            ? "paused"
            : "playing",
        duration: Math.round(video?.duration ?? 0),
        subtitles: [],
        fullscreen: !!document.fullscreenElement,
      };
      return status;
    });

    logger.debug(`Got status ${status}`);
    return status;
  };

  return interval(1000).pipe(
    exhaustMap(() => {
      return defer(() => getStatus());
    }),
    filter((v) => v !== undefined),
    map<YoutubePlayerStatus, YoutubeStatusWebsocketEvent>((status) => {
      return {
        type: "youtube-status",
        data: status,
      };
    })
  );
}

const fakeResponse = {
  kind: "youtube#searchListResponse",
  etag: "enpO22XCkGX3QkFH8_0-S12yHaE",
  nextPageToken: "CAUQAA",
  regionCode: "NO",
  pageInfo: { totalResults: 1000000, resultsPerPage: 7 },
  items: [
    {
      kind: "youtube#searchResult",
      etag: "kjYOk9dFGiN4GT1_wPr31ztClkM",
      id: { kind: "youtube#video", videoId: "CZEt7oskugw" },
      snippet: {
        publishedAt: "2025-01-09T10:24:25Z",
        channelId: "UC5YOtgiRDTgco0eQjeozWWg",
        title:
          "Harry Potter battling it out with Barbie? Now that&#39;s something you wouldn&#39;t expect! 🪄💖",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/CZEt7oskugw/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/CZEt7oskugw/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/CZEt7oskugw/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "ClipMyHorseTV International",
        liveBroadcastContent: "none",
        publishTime: "2025-01-09T10:24:25Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "Y9YAk9ZmC4YXI6iCJXVwCj6MEq4",
      id: { kind: "youtube#video", videoId: "bHiZjBCnGbM" },
      snippet: {
        publishedAt: "2024-02-10T12:33:24Z",
        channelId: "UCqTBRaMkARQNryHkAf3o-Ig",
        title: "1 HOUR of HAPPY HORSES to Make Your Day Better!",
        description:
          "Enjoy 1 hour of beautiful horses from around the world! A feel good video with happy music to bring you joy! Perfect for a ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/bHiZjBCnGbM/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/bHiZjBCnGbM/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/bHiZjBCnGbM/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "DiscoverTheHorse",
        liveBroadcastContent: "none",
        publishTime: "2024-02-10T12:33:24Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "6-J2Uf0mq2__HtemGZpuXsMsZOQ",
      id: { kind: "youtube#video", videoId: "XuD7WE22Dkk" },
      snippet: {
        publishedAt: "2019-12-27T14:43:30Z",
        channelId: "UC97AiIzJnLnOQ70lxdtKCeA",
        title: "The cutest little toddler horse rider and her pony",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/XuD7WE22Dkk/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/XuD7WE22Dkk/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/XuD7WE22Dkk/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "My little animal world ",
        liveBroadcastContent: "none",
        publishTime: "2019-12-27T14:43:30Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "QyObKg7kbThuPP2Hel4faYT4GpU",
      id: { kind: "youtube#video", videoId: "zJ5HQ17AFO8" },
      snippet: {
        publishedAt: "2025-04-15T06:17:42Z",
        channelId: "UCSC4I2YPgd5wGOCQY37L88w",
        title:
          "Get ready, saddle up and ride with us🐴 #shorts #horse #equestrian #pony",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/zJ5HQ17AFO8/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/zJ5HQ17AFO8/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/zJ5HQ17AFO8/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "line laagasken",
        liveBroadcastContent: "none",
        publishTime: "2025-04-15T06:17:42Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "dNXbiXeYVBNL-SyiJM7MkEZlA3o",
      id: { kind: "youtube#video", videoId: "1bRkKv4RWIQ" },
      snippet: {
        publishedAt: "2019-07-29T12:00:00Z",
        channelId: "UCL0ew8cMuPMJ0nNegDQd0Tg",
        title: "KØBTE EGEN GÅRD SOM 17-ÅRIG: - Bare spring ud i det",
        description:
          "Anne-Mette var bare 17 år gammel, da hun købte sin egen gård lidt uden for Fredericia. I dag er der gået tre år, og hun driver nu ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/1bRkKv4RWIQ/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/1bRkKv4RWIQ/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/1bRkKv4RWIQ/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Schwung",
        liveBroadcastContent: "none",
        publishTime: "2019-07-29T12:00:00Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "rnD5FWVEVomfMq1z-yQoIhguReg",
      id: { kind: "youtube#video", videoId: "uDrpRKl_MzI" },
      snippet: {
        publishedAt: "2025-08-02T10:23:39Z",
        channelId: "UCbISqx_TljiXe_GyPmniweg",
        title:
          "PANIKKEN når dette skjer 😳 #hest #hestesport #hesteridning #hestejente #rideliv #rytter",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/uDrpRKl_MzI/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/uDrpRKl_MzI/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/uDrpRKl_MzI/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Clara Norling",
        liveBroadcastContent: "none",
        publishTime: "2025-08-02T10:23:39Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "ChQS6ZOPSp1eaLxOwNCYRUguqlA",
      id: { kind: "youtube#video", videoId: "1AqWTRRcFC4" },
      snippet: {
        publishedAt: "2025-07-10T16:57:06Z",
        channelId: "UCpqVjJLZTSs8erDV-5eVJgA",
        title: "⚠️Hesten skrek – og eieren snappet! #dyreredning",
        description:
          "dyr #animalrescue #wildliferescue #arcticanimal #hest #farm En rolig hvit islandshest ble overfalt av en parasittisk ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/1AqWTRRcFC4/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/1AqWTRRcFC4/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/1AqWTRRcFC4/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "RescueBot",
        liveBroadcastContent: "none",
        publishTime: "2025-07-10T16:57:06Z",
      },
    },
  ],
};
