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
  YoutubeCommand,
  YoutubePlayerStatus,
  YoutubeSearchResponse,
} from "../../domain/youtube";
import { BaseApp } from "../app-manager";
import { Env } from "../environment";
import { logger } from "../logger";
import { Keyboard } from "../os/keyboard";
import { Program } from "../os/program";
import { BrowserService } from "../service/browser-service";
import { WebSocketComs } from "../service/web-socket-coms";

export interface YouTubeApp extends BaseApp {
  type: "youtube";
  search: (query: string) => Promise<YoutubeSearchResponse>;
  runCommand: (command: YoutubeCommand) => Promise<void>;
}

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
        `/youtube/v3/search?key=${Env.youtube.apiKey}&type=video&part=snippet&q=${query}&maxResults=50`
      );

      logger.debug(chalk.gray(`GET ${url}`));

      if (Env.production) {
        return fetch(url).then((r) => r.json());
      } else {
        return Promise.resolve(fakeResponse);
      }
    },
    runCommand: async (command: YoutubeCommand) => {
      const page = browserService.getPage();

      switch (command.action) {
        case "play":
          logger.debug(`Starting video ${JSON.stringify(command)}`);

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
          break;
        case "resume":
          logger.debug(`Resuming video`);
          await page.evaluate(() => {
            document.querySelector("video")?.play();
          });
          break;
        case "pause":
          logger.debug(`Pausing video`);
          await page.evaluate(() => {
            document.querySelector("video")?.pause();
          });
          break;
        case "seek":
          logger.debug(`Seeking to ${command.data}`);
          await page.evaluate((to: number) => {
            document.querySelector("video")?.fastSeek(to);
          }, command.data);
          break;
        case "setVolume":
          logger.debug(`Set volume to ${command.data}`);
          await page.evaluate((volume) => {
            const slider = document.querySelector(".ytp-volume-slider");
            const panel = document.querySelector(".ytp-volume-panel");

            if (!slider || !panel) {
              throw new Error(
                "Unable to find element .ytp-volume-slider or .ytp-volume-panel"
              );
            }

            panel.setAttribute("style", "width:52px!important");
            const rect = slider.getBoundingClientRect();
            const x = rect.left + rect.width * volume;
            const y = rect.top + rect.height / 2;

            slider.dispatchEvent(
              new MouseEvent("mousedown", {
                clientX: x,
                clientY: y,
                bubbles: true,
              })
            );
            slider.dispatchEvent(
              new MouseEvent("mouseup", {
                clientX: x,
                clientY: y,
                bubbles: true,
              })
            );
          }, command.data);
          break;
        case "next":
          logger.debug(`Next video`);
          await page.evaluate(() => {});
          break;
        case "prev":
          logger.debug(`Previous video`);
          await page.evaluate(() => {});
          break;
        default:
          throw Error(`Unknown Youtube action ${command}`);
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

function y(path: string) {
  return `https://www.googleapis.com${path}`;
}

function createYoutubeObserver(
  browserService: BrowserService
): Observable<WebsocketEvent> {
  const getStatus = async (): Promise<YoutubePlayerStatus | undefined> => {
    const page = browserService.getPage();

    return await page.$$eval("video", (e) => {
      const video = e[0];
      const status: YoutubePlayerStatus = {
        title: document.title,
        position: Math.round(video?.currentTime ?? 0),
        volume: video?.volume ?? 0,
        muted: video?.muted ?? false,
        loading: video?.readyState < 4,
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
  etag: "2D8ABaKtnG34XkHvyr-uiYhMQ8o",
  nextPageToken: "CDIQAA",
  regionCode: "NO",
  pageInfo: { totalResults: 1000000, resultsPerPage: 50 },
  items: [
    {
      kind: "youtube#searchResult",
      etag: "AW0vFPg9Y9Vo0mYF9QFSHogSTXg",
      id: { kind: "youtube#channel", channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw" },
      snippet: {
        publishedAt: "2014-12-21T21:21:10Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "shroud",
        description:
          "Yo, welcome to my channel. I play a lot of FPS games and also post other genre of games and IRL content from time to time.",
        thumbnails: {
          default: {
            url: "https://yt3.ggpht.com/1JP91m1bN52qiUOGFIfHOHFSR62_Ll0FpYF4-UM2zFXv3V_azvHY3PT1sgfggzjNKxwqbulr=s88-c-k-c0xffffffff-no-rj-mo",
          },
          medium: {
            url: "https://yt3.ggpht.com/1JP91m1bN52qiUOGFIfHOHFSR62_Ll0FpYF4-UM2zFXv3V_azvHY3PT1sgfggzjNKxwqbulr=s240-c-k-c0xffffffff-no-rj-mo",
          },
          high: {
            url: "https://yt3.ggpht.com/1JP91m1bN52qiUOGFIfHOHFSR62_Ll0FpYF4-UM2zFXv3V_azvHY3PT1sgfggzjNKxwqbulr=s800-c-k-c0xffffffff-no-rj-mo",
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2014-12-21T21:21:10Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "O6UCux00_IqGEpPF8ePXOokYYT4",
      id: { kind: "youtube#video", videoId: "vW48sYsQGio" },
      snippet: {
        publishedAt: "2025-08-15T02:30:59Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "HOW SHROUD &amp; TARIK BROKE BATTLEFIELD 6",
        description:
          "Shroud & Tarik squad up in Battlefield 6. Tarik goes full pocket mode, constantly healing and reviving Shroud the entire match ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/vW48sYsQGio/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/vW48sYsQGio/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/vW48sYsQGio/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-15T02:30:59Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "mMvuU8QquQzO6BvD38UYpH1hR7I",
      id: { kind: "youtube#video", videoId: "nuKQp0On6j8" },
      snippet: {
        publishedAt: "2024-02-23T14:00:38Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Jynxzi realizes how good shroud is",
        description:
          "Shroud and jynxzi play 2v2 against every rank in rainbow 6 siege and this is where jynxzi realizes how good shroud is #shroud ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/nuKQp0On6j8/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/nuKQp0On6j8/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/nuKQp0On6j8/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-02-23T14:00:38Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "4DXIJV6M6uugpAjNLxutboHFYSo",
      id: { kind: "youtube#video", videoId: "4VzjeMdbHKU" },
      snippet: {
        publishedAt: "2024-10-07T19:26:48Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "12 MINUTES OF SHROUD BEING A HUMAN AIMBOT",
        description:
          "12 minutes of shroud being a human aimbot and proving to us he's not actually a robot *SECRET* PROMO CODE ON ALL ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/4VzjeMdbHKU/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/4VzjeMdbHKU/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/4VzjeMdbHKU/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-10-07T19:26:48Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "LjRJB_CiZXVZ9zQJBxi0pUf1vGg",
      id: { kind: "youtube#video", videoId: "7IElm9wXGJ4" },
      snippet: {
        publishedAt: "2025-08-08T22:33:26Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD IS DESTROYING EVERYONE IN BATTLEFIELD 6",
        description:
          "Shroud goes on an absolute tear in the new Battlefield 6 Beta, getting an almost flawless 60 frag game. What has been your best ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/7IElm9wXGJ4/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/7IElm9wXGJ4/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/7IElm9wXGJ4/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-08T22:33:26Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "kOVz-9V_8KyWPWM0pcw8UNMZFQ8",
      id: { kind: "youtube#video", videoId: "e91mnGleC3Q" },
      snippet: {
        publishedAt: "2025-08-12T00:43:42Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "I FOUND THE BEST GUN IN BATTLEFIELD 6",
        description:
          "Shroud discovers the true power of the M87A1 shotgun in the new Battlefield 6 Beta, as he goes on an absolute tear through ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/e91mnGleC3Q/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/e91mnGleC3Q/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/e91mnGleC3Q/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-12T00:43:42Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "pZPPXxQBg_mTjG8vz-bbp1AS0LI",
      id: { kind: "youtube#video", videoId: "zNOnWLRxM24" },
      snippet: {
        publishedAt: "2024-02-07T17:33:21Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD RETURNS TO PUBG IN 2024",
        description:
          "shroud plays pubg and has some crazy moments that we put into highlights to really showcase how insane he is at the game and ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/zNOnWLRxM24/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/zNOnWLRxM24/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/zNOnWLRxM24/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-02-07T17:33:21Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "4xhmWVUKVoBkoc5xmP978Fq2_a8",
      id: { kind: "youtube#video", videoId: "lFCVkchZDis" },
      snippet: {
        publishedAt: "2025-07-09T03:07:51Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD RETURNS TO COUNTER STRIKE 2",
        description:
          "Shroud returns to CS2 after a long hiatus and teams up with Tarik, TheBurntPeanut, Summit and Hutch to see how the games ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/lFCVkchZDis/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/lFCVkchZDis/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/lFCVkchZDis/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-07-09T03:07:51Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "YMpAISpJI_SbafNBT90eQ0ROeBM",
      id: { kind: "youtube#video", videoId: "3D7EZAKQm50" },
      snippet: {
        publishedAt: "2024-02-24T13:27:31Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "I Might Have Found The Best Gaming Duo",
        description:
          "Shroud and jynxzi played 2v2 against every rank in rainbow six siege and their level of coms were insane. #gaming #jynxzi ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/3D7EZAKQm50/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/3D7EZAKQm50/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/3D7EZAKQm50/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-02-24T13:27:31Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "As73EKhGt9SN_H6Da0iWFRvNrLY",
      id: { kind: "youtube#video", videoId: "DZFHbsnGZWo" },
      snippet: {
        publishedAt: "2025-07-10T04:27:45Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "So I hired Tarik to REVIVE NA CS in 2025",
        description:
          "Shroud and Tarik continue their Premier adventures with Summit and TheBurntPeanut, this time doing it for the sake of NA CS.",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/DZFHbsnGZWo/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/DZFHbsnGZWo/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/DZFHbsnGZWo/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-07-10T04:27:45Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "ayWCuDfu6F_mmyviLUGAhDBbb_4",
      id: { kind: "youtube#video", videoId: "4d3rzIusTcg" },
      snippet: {
        publishedAt: "2024-08-23T08:14:20Z",
        channelId: "UCESBL3qcbb9jLw7jq9gh4nQ",
        title: "The Shroud Of Turin New Evidence Explained (Part 1/2)",
        description:
          "The linen cloth of the Shroud of Turin – believed by some to have wrapped the body of Jesus following his crucifixion – may date ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/4d3rzIusTcg/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/4d3rzIusTcg/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/4d3rzIusTcg/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "The i Paper",
        liveBroadcastContent: "none",
        publishTime: "2024-08-23T08:14:20Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "dPvq4K7X164q3viVs8e4sHynGlo",
      id: { kind: "youtube#video", videoId: "87m1P1RLYfg" },
      snippet: {
        publishedAt: "2025-07-03T23:06:18Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "16 MINUTES OF CLASSIC SHROUD MOMENTS",
        description:
          "A collection of some of Shroud's most classic and nostalgic moments as we roll back the clock and relive the prime days of CS:GO, ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/87m1P1RLYfg/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/87m1P1RLYfg/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/87m1P1RLYfg/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-07-03T23:06:18Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "XDPd1AfQELUroFb4u42JeHf5bP8",
      id: { kind: "youtube#video", videoId: "YT1R2kDPHFA" },
      snippet: {
        publishedAt: "2024-10-28T19:59:41Z",
        channelId: "UCF9IOB2TExg3QIBupFtBDxg",
        title: "Shroud studies",
        description:
          "Link to download my PowerPoint, https://drjohncampbell.co.uk/ Shroud.com https://www.shroud.com/menu.htm Shroudphotos.com ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/YT1R2kDPHFA/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/YT1R2kDPHFA/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/YT1R2kDPHFA/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Dr. John Campbell",
        liveBroadcastContent: "none",
        publishTime: "2024-10-28T19:59:41Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "FIKaawh-G9R6aLVsNmXop8SlGBc",
      id: { kind: "youtube#video", videoId: "OwnbKxSKNMw" },
      snippet: {
        publishedAt: "2025-08-08T01:50:17Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "BATTLEFIELD 6 FIRST IMPRESSIONS - THE BEST ONE YET",
        description:
          "Shroud dives into the release of the Battlefield 6 Beta and gives his opinions after playing his first 2 games. What are your ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/OwnbKxSKNMw/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/OwnbKxSKNMw/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/OwnbKxSKNMw/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-08T01:50:17Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "8lOKIVf3yKL6MWzmtvn26AhipeQ",
      id: { kind: "youtube#video", videoId: "7Ee6T6ogjeM" },
      snippet: {
        publishedAt: "2018-05-30T20:31:16Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "44 FRAG SQUAD GAME!",
        description:
          "All highlights are from my stream :D ▻ Follow me! TWITTER → https://twitter.com/shroud TWITCH → https://www.twitch.tv/shroud ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/7Ee6T6ogjeM/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/7Ee6T6ogjeM/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/7Ee6T6ogjeM/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2018-05-30T20:31:16Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "q1M4sex_RkzVWS8P_yhl1GJxxUU",
      id: { kind: "youtube#video", videoId: "8FUDlzHWfbU" },
      snippet: {
        publishedAt: "2025-01-25T01:00:10Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD REUNION WITH C9 SKADOODLE vs 5 NOOBS IN CS2",
        description:
          "Shroud & Skadoodle 2v5 Against Fragathon Donators in Counter-Strike 2. *SECRET* PROMO CODE ON ALL LOGITECH ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/8FUDlzHWfbU/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/8FUDlzHWfbU/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/8FUDlzHWfbU/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-01-25T01:00:10Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "BlJNe6RPRZroK_PFdHwbajN7rhI",
      id: { kind: "youtube#video", videoId: "d3qIDEnXLY4" },
      snippet: {
        publishedAt: "2025-08-09T21:49:48Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "I GOT RANK 1 IN EVERY MAP OF BATTLEFIELD 6",
        description:
          "shroud plays battlefield 6 and starts to dominate in every map of the beta. Less than 24h and he's already consistently in first place ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/d3qIDEnXLY4/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/d3qIDEnXLY4/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/d3qIDEnXLY4/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-09T21:49:48Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "dL94Rgfu76aVTHUHwrQ02J8kAyU",
      id: { kind: "youtube#video", videoId: "PcObP_9zG5o" },
      snippet: {
        publishedAt: "2024-08-23T15:22:56Z",
        channelId: "UCz8QaiQxApLq8sLNcszYyJw",
        title:
          "AI Reveals Jesus&#39; &quot;True Face&quot; Using The Ancient Shroud Of Turin | Subscribe to Firstpost",
        description:
          'AI Reveals Jesus\' "True Face" Using The Ancient Shroud Of Turin | Subscribe to Firstpost An AI-generated image of Jesus Christ ...',
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/PcObP_9zG5o/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/PcObP_9zG5o/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/PcObP_9zG5o/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Firstpost",
        liveBroadcastContent: "none",
        publishTime: "2024-08-23T15:22:56Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "fFkQWA8_7P7drnsYmzISUcSgLvc",
      id: { kind: "youtube#video", videoId: "_BKqWZub9oM" },
      snippet: {
        publishedAt: "2025-06-25T21:34:37Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "10 MINUTES OF STREAMERS SHOCKED BY SHROUDS INSANE MOMENTS",
        description:
          "A compilation of streamers and pro players reacting to some of Shroud most insane aim moments and clutches including Jynxzi, ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/_BKqWZub9oM/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/_BKqWZub9oM/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/_BKqWZub9oM/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-06-25T21:34:37Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "t_uZPcQV_BsSu5VuB2aSFNxvwS0",
      id: { kind: "youtube#video", videoId: "ncPiCoYQC6g" },
      snippet: {
        publishedAt: "2025-06-06T07:24:45Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "My Journey into Dune",
        description:
          "SECRET* PROMO CODE ON ALL LOGITECH PRODUCTS: shroud THE PERFECT MOUSE ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/ncPiCoYQC6g/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/ncPiCoYQC6g/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/ncPiCoYQC6g/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-06-06T07:24:45Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "2Np8ztpEbaEtMSGmrSTeqKVW0Cg",
      id: { kind: "youtube#video", videoId: "djqE4oTm4uc" },
      snippet: {
        publishedAt: "2023-09-13T13:45:04Z",
        channelId: "UCPq2ETz4aAGo2Z-8JisDPIA",
        title: "Only Shroud can one-deag with his mouse in the air",
        description:
          "Watch live on Twitch: https://www.twitch.tv/eslcs Join the discussion: http://www.twitter.com/eslcs http://www.facebook.com/eslcs ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/djqE4oTm4uc/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/djqE4oTm4uc/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/djqE4oTm4uc/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "ESL Counter-Strike",
        liveBroadcastContent: "none",
        publishTime: "2023-09-13T13:45:04Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "PnCCwtt1_vf6RM8GZYbEphyf19c",
      id: { kind: "youtube#video", videoId: "RQPbAjINT-E" },
      snippet: {
        publishedAt: "2024-03-11T20:58:46Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Shroud Talks About The Game With The BIGGEST Cheating Problem",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/RQPbAjINT-E/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/RQPbAjINT-E/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/RQPbAjINT-E/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-03-11T20:58:46Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "EPRIPiS6GnKIiOFSH6yA7rQgmMM",
      id: { kind: "youtube#video", videoId: "OzJJ5EBE67g" },
      snippet: {
        publishedAt: "2022-03-22T12:00:12Z",
        channelId: "UCSCoziKHqjqbox3Fv3Pb4BA",
        title: "Just 1 MINUTE of shroud FLEXING his money...",
        description:
          "shroud #twitch #gaming #csgo Top streamers make a lot of money, we all know that. But shroud… is on another level when it ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/OzJJ5EBE67g/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/OzJJ5EBE67g/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/OzJJ5EBE67g/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "theScore esports",
        liveBroadcastContent: "none",
        publishTime: "2022-03-22T12:00:12Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "baoFVsUCNOBr_aLpIu3_Gz9mouk",
      id: { kind: "youtube#video", videoId: "wQwlKXtsYeg" },
      snippet: {
        publishedAt: "2025-08-09T07:35:01Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "RAW UNCUT BF6 GAMEPLAY!",
        description:
          "SECRET* PROMO CODE ON ALL LOGITECH PRODUCTS: shroud THE PERFECT MOUSE ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/wQwlKXtsYeg/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/wQwlKXtsYeg/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/wQwlKXtsYeg/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-09T07:35:01Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "1DZR82sovr98Om5faB30U3rL_Z8",
      id: { kind: "youtube#video", videoId: "TwbRl5K3YiQ" },
      snippet: {
        publishedAt: "2025-08-15T05:28:29Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "BF6! Open Weekend #2 EMPIRE STATE AND RUSH!",
        description:
          "SECRET* PROMO CODE ON ALL LOGITECH PRODUCTS: shroud THE PERFECT MOUSE ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/TwbRl5K3YiQ/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/TwbRl5K3YiQ/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/TwbRl5K3YiQ/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-15T05:28:29Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "2emDu4HTVIvLEzbGHffMu6tAwLI",
      id: { kind: "youtube#video", videoId: "1RW8I6uqnzk" },
      snippet: {
        publishedAt: "2018-02-15T14:37:37Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD DESTROYING DUOS",
        description:
          "FULL GAME LADS ▻ Follow me! TWITTER → https://twitter.com/C9shroud TWITCH → https://www.twitch.tv/shroud STEAM ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/1RW8I6uqnzk/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/1RW8I6uqnzk/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/1RW8I6uqnzk/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2018-02-15T14:37:37Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "7SxahPruAS6ckvsOE8YKxD_O5sw",
      id: { kind: "youtube#video", videoId: "zRGf2_Gj7Xc" },
      snippet: {
        publishedAt: "2023-11-24T18:59:46Z",
        channelId: "UC9MAhZQQd9egwWCxrwSIsJQ",
        title:
          "The UnXplained: The Mystery Behind the Shroud of Turin (Special)",
        description:
          "From relics like the Ark of the Covenant and the Shroud of Turin, to a tower that could touch heaven, is it possible to uncover the ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/zRGf2_Gj7Xc/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/zRGf2_Gj7Xc/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/zRGf2_Gj7Xc/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "HISTORY",
        liveBroadcastContent: "none",
        publishTime: "2023-11-24T18:59:46Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "1trY-m-nsszRsTKu-kMSGjAOZxY",
      id: { kind: "youtube#video", videoId: "i7ct2iDm5Fk" },
      snippet: {
        publishedAt: "2025-08-08T18:20:20Z",
        channelId: "UCYI_ychRnL7sJrG6PUSBpQA",
        title: "Shroud of Turin Discovery Sparks Major Controversy",
        description:
          "Arguably the most intriguing and controversial religious relic in the world, the Shroud of Turin, is facing major scrutiny from new 3D ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/i7ct2iDm5Fk/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/i7ct2iDm5Fk/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/i7ct2iDm5Fk/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "CBN News",
        liveBroadcastContent: "none",
        publishTime: "2025-08-08T18:20:20Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "TOQdzEx8w-FrBYVT_asYIaPCrfo",
      id: { kind: "youtube#video", videoId: "s5jx_uzGRzc" },
      snippet: {
        publishedAt: "2023-11-10T18:17:29Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD CLIMBS TO THE TOP OF COUNTER STRIKE 2",
        description:
          "shroud gets his counter strike 2 rank and starts speedrunning and playing cs2 rank all the way to the top! PROMO CODE ON ALL ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/s5jx_uzGRzc/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/s5jx_uzGRzc/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/s5jx_uzGRzc/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2023-11-10T18:17:29Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "kJ0v_ZzxVoGNzKuyJflu0fsxBDQ",
      id: { kind: "youtube#video", videoId: "zJec1826xiE" },
      snippet: {
        publishedAt: "2024-05-04T18:00:49Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "THIS IS WHY SHROUD WAS THE KING OF PUBG",
        description:
          "shroud comes back to pubg and starts dominating right away. showing us why he was the king of pubg for the longest time.",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/zJec1826xiE/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/zJec1826xiE/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/zJec1826xiE/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-05-04T18:00:49Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "ie4uEjEZzP0QBJpkXJQv-ND_j6s",
      id: { kind: "youtube#video", videoId: "RHNk7uc3uNo" },
      snippet: {
        publishedAt: "2024-07-26T19:58:40Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Shroud Got Reported For This",
        description:
          "Shroud plays fragpunk and absolutely destroys the enemy team with his aim #gaming #shroud #fps.",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/RHNk7uc3uNo/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/RHNk7uc3uNo/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/RHNk7uc3uNo/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-07-26T19:58:40Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "CgnKxZh_U9Kelb1qPtdQlZv-1sw",
      id: { kind: "youtube#video", videoId: "x0AclBGKEyI" },
      snippet: {
        publishedAt: "2024-02-13T15:00:50Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "How Shroud Ruined Tarkov For Him",
        description:
          "shroud plays escape from tarkov and baits this EFT player in the most devious way possible #escapefromtarkov #gaming ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/x0AclBGKEyI/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/x0AclBGKEyI/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/x0AclBGKEyI/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-02-13T15:00:50Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "beU8ugEIPQnYQesoXTDgkbeHmyY",
      id: { kind: "youtube#video", videoId: "A5V5EMXV160" },
      snippet: {
        publishedAt: "2025-08-08T07:35:45Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Battlefield is BACK! BF6 GAMEPLAY.",
        description:
          "SECRET* PROMO CODE ON ALL LOGITECH PRODUCTS: shroud THE PERFECT MOUSE ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/A5V5EMXV160/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/A5V5EMXV160/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/A5V5EMXV160/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-08T07:35:45Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "Hx3EV_BbdObdKrqOWUR8o0L0r3c",
      id: { kind: "youtube#video", videoId: "WgjgLPzA8w0" },
      snippet: {
        publishedAt: "2025-08-07T00:46:56Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "12 MINUTES OF PRIME CSGO SHROUD MOMENTS",
        description:
          "Relive the glory of Shroud's prime CS:GO days with this compilation of flicks, clutches and snipes from the golden era of ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/WgjgLPzA8w0/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/WgjgLPzA8w0/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/WgjgLPzA8w0/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-07T00:46:56Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "EDzpG8nsL-hopCLctp6L3QGjnDQ",
      id: { kind: "youtube#video", videoId: "llFv9UNG2rQ" },
      snippet: {
        publishedAt: "2025-08-04T01:33:36Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD REACTS TO NEW BATTLEFIELD 6 TRAILER + GAMEPLAY",
        description:
          "Shroud catches up on the new Battlefield 6 trailer and gameplay videos he missed while he was busy, getting up to date with all ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/llFv9UNG2rQ/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/llFv9UNG2rQ/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/llFv9UNG2rQ/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-04T01:33:36Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "Q58UTjNPOAaYsnxUWUPcrW17YRQ",
      id: { kind: "youtube#video", videoId: "G4OYfD3iT6o" },
      snippet: {
        publishedAt: "2021-04-14T23:30:00Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "7 Times Shroud DECIMATED Twitch Streamers",
        description:
          "I hope there're no hard feelings. Introducing Shroud Moments! Shroud Moments is a new series where I show you memorable ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/G4OYfD3iT6o/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/G4OYfD3iT6o/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/G4OYfD3iT6o/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2021-04-14T23:30:00Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "4o9zYnP4Y-xgz01fqoZQ_Lz5rbM",
      id: { kind: "youtube#video", videoId: "ORCLuPAuWZ0" },
      snippet: {
        publishedAt: "2018-07-07T19:00:01Z",
        channelId: "UCSCoziKHqjqbox3Fv3Pb4BA",
        title: "The Story of Shroud: The King of Reddit",
        description:
          "To be famous in the world of esports, it's safe to say you need to be able to appreciate a good meme. True superstardom in this ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/ORCLuPAuWZ0/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/ORCLuPAuWZ0/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/ORCLuPAuWZ0/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "theScore esports",
        liveBroadcastContent: "none",
        publishTime: "2018-07-07T19:00:01Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "Y_plzczc0wGCsTA0j_PrehCHPHM",
      id: { kind: "youtube#video", videoId: "6Qf5aX3O3io" },
      snippet: {
        publishedAt: "2025-01-29T16:00:07Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "3 PROS VS 5 NOOBS IN COUNTER STRIKE 2",
        description:
          "Shroud, TenZ & Skadoodle Face a 3v5 Against Fragathon Donators in Counter-Strike 2. *SECRET* PROMO CODE ON ALL ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/6Qf5aX3O3io/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/6Qf5aX3O3io/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/6Qf5aX3O3io/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-01-29T16:00:07Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "SOtVs-Fog0BP06YFud0NF-fNf80",
      id: { kind: "youtube#video", videoId: "kdb3jnNd4h4" },
      snippet: {
        publishedAt: "2025-07-03T01:34:04Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "So we spent $50,000 on CS cases..",
        description:
          "After Nadeshot is $30000 deep into his CS case opening adventure, Shroud joins him and Timthetatman to try their luck too, and it ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/kdb3jnNd4h4/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/kdb3jnNd4h4/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/kdb3jnNd4h4/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-07-03T01:34:04Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "dpHpA7stc-v4SmWsjtpOV_kpfm8",
      id: { kind: "youtube#video", videoId: "Uug1B0pN7Lk" },
      snippet: {
        publishedAt: "2023-02-11T01:00:20Z",
        channelId: "UCSCoziKHqjqbox3Fv3Pb4BA",
        title: "How GOOD was Shroud really?",
        description:
          "shorts #gaming #csgo With shroud dominating the streaming world, it's easy to forget that Shroud used to be a CS:GO pro... and ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/Uug1B0pN7Lk/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/Uug1B0pN7Lk/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/Uug1B0pN7Lk/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "theScore esports",
        liveBroadcastContent: "none",
        publishTime: "2023-02-11T01:00:20Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "hRlKxee4VNYiYrV0KdRkNRuARi8",
      id: { kind: "youtube#video", videoId: "FExZvDig7ZE" },
      snippet: {
        publishedAt: "2025-03-17T22:35:53Z",
        channelId: "UCSCoziKHqjqbox3Fv3Pb4BA",
        title: "SHROUD&#39;S GAME IS DEAD",
        description:
          "shorts #SpectreDivide #Shroud #fps #gaming Spectre Divide has bit the dust. Hosted by: Dimitri Pascaluta Written by: Elisabeth ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/FExZvDig7ZE/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/FExZvDig7ZE/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/FExZvDig7ZE/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "theScore esports",
        liveBroadcastContent: "none",
        publishTime: "2025-03-17T22:35:53Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "Dhy1hvXVuLm0ktvxLnlbzsngHAs",
      id: { kind: "youtube#video", videoId: "dSDvY_s2YYA" },
      snippet: {
        publishedAt: "2025-08-08T22:07:50Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "What Happens When Shroud Goes FULL Support",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/dSDvY_s2YYA/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/dSDvY_s2YYA/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/dSDvY_s2YYA/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-08T22:07:50Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "ktYbjJztTqhFmF0QFEjQ5HKiV2c",
      id: { kind: "youtube#video", videoId: "ssnR1o7rFAI" },
      snippet: {
        publishedAt: "2024-05-16T02:23:26Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title:
          "Shroud Asks “What Is The HARDEST FPS Game” to The Best Rainbow 6 Player",
        description: "",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/ssnR1o7rFAI/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/ssnR1o7rFAI/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/ssnR1o7rFAI/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-05-16T02:23:26Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "RN0IOQSnmtjpnPex6mSYfX69HgI",
      id: { kind: "youtube#video", videoId: "Uje7vNktMP8" },
      snippet: {
        publishedAt: "2025-08-16T20:45:04Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Shroud Plays the NEWEST Battlefield 6 Map",
        description:
          "Shroud tries out the newest addition to the Battlefield 6 Beta, Brooklyn, on both Conquest and new game mode Rush. What do ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/Uje7vNktMP8/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/Uje7vNktMP8/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/Uje7vNktMP8/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-08-16T20:45:04Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "_Y4oJ-YnjovhmhFLvvqQHzrvKhQ",
      id: { kind: "youtube#video", videoId: "Qto1u_uetiw" },
      snippet: {
        publishedAt: "2023-03-27T00:17:44Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD&#39;S BEST PLAYS IN COUNTER STRIKE 2",
        description:
          "Shroud plays Counter Strike 2 and does insane plays in his first days playing counter strike 2. He already reaches an insane ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/Qto1u_uetiw/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/Qto1u_uetiw/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/Qto1u_uetiw/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2023-03-27T00:17:44Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "9FGlFwPvBna8ZDSRTmCFTxEp3_Y",
      id: { kind: "youtube#video", videoId: "U-1Y7C3wI9A" },
      snippet: {
        publishedAt: "2023-09-21T15:47:29Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD&#39;S BEST GAME OF COUNTER STRIKE 2",
        description:
          "Shroud plays counter strike 2 and has his best game yet in terms of cs2 gameplay and aim prowess... he truly is *free* in the way ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/U-1Y7C3wI9A/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/U-1Y7C3wI9A/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/U-1Y7C3wI9A/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2023-09-21T15:47:29Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "3lCyuD3iT9bx9xZ87yPHWCLB39U",
      id: { kind: "youtube#video", videoId: "gOhjGvdS0cs" },
      snippet: {
        publishedAt: "2018-08-12T16:00:56Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "SHROUD WINNING 3 PUBG GAMES IN A ROW!",
        description:
          "All highlights are from my stream :D ▻ Follow me! TWITTER → https://twitter.com/shroud TWITCH → https://www.twitch.tv/shroud ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/gOhjGvdS0cs/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/gOhjGvdS0cs/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/gOhjGvdS0cs/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2018-08-12T16:00:56Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "cmRaKal0miwSIrQuBLhZSC-X9YE",
      id: { kind: "youtube#video", videoId: "gPgPd2ID_fU" },
      snippet: {
        publishedAt: "2024-02-23T02:26:55Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Shroud first interaction with Jynxzi",
        description:
          "shroud and jynxzi play rainbow 6 siege and 2v2 against every rank -- this is how their interactions started #gaming #jynxzi ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/gPgPd2ID_fU/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/gPgPd2ID_fU/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/gPgPd2ID_fU/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2024-02-23T02:26:55Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "jbaojJnYUloKIj3pEx7F6KGATfk",
      id: { kind: "youtube#video", videoId: "kjgCzRMsOgk" },
      snippet: {
        publishedAt: "2025-05-30T21:28:53Z",
        channelId: "UCoz3Kpu5lv-ALhR4h9bDvcw",
        title: "Shroud Trolls Top Streamers In Marvel Rivals For 13 Minutes",
        description:
          "As part of the playtest for the new Marvel Rivals character Ultron, Shroud has some hilarious troll moments against some of the ...",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/kjgCzRMsOgk/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/kjgCzRMsOgk/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/kjgCzRMsOgk/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "shroud",
        liveBroadcastContent: "none",
        publishTime: "2025-05-30T21:28:53Z",
      },
    },
    {
      kind: "youtube#searchResult",
      etag: "J3uj0BxBuvQUdnqE84-SCU2xsD8",
      id: { kind: "youtube#video", videoId: "aCbcd0IiH9g" },
      snippet: {
        publishedAt: "2022-08-18T20:15:31Z",
        channelId: "UCNcWiCgpHVctNxLr3FD04PA",
        title: "Shroud &amp; ShahZaM in the CSGO Days...",
        description:
          "The good old days #shorts #sentinels #sen #valorant #lcq #tenz #shroud #dapr #shahzam #zellsis #csgo.",
        thumbnails: {
          default: {
            url: "https://i.ytimg.com/vi/aCbcd0IiH9g/default.jpg",
            width: 120,
            height: 90,
          },
          medium: {
            url: "https://i.ytimg.com/vi/aCbcd0IiH9g/mqdefault.jpg",
            width: 320,
            height: 180,
          },
          high: {
            url: "https://i.ytimg.com/vi/aCbcd0IiH9g/hqdefault.jpg",
            width: 480,
            height: 360,
          },
        },
        channelTitle: "Sentinels",
        liveBroadcastContent: "none",
        publishTime: "2022-08-18T20:15:31Z",
      },
    },
  ],
};
