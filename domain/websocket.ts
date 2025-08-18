import type { MediaResponse } from "./media";
import type { TrackedVlcMediaStatus } from "./vlc-media-status";
import type { YoutubePlayerStatus } from "./youtube";

export type WebsocketEventType = "vlc-status" | "youtube-status" | "media";

export interface BaseWebsocketEvent {
  type: WebsocketEventType;
}

export interface MediaWebsocketEvent extends BaseWebsocketEvent {
  type: "media";
  data: MediaResponse;
}

export interface VlcStatusWebsocketEvent extends BaseWebsocketEvent {
  type: "vlc-status";
  data: TrackedVlcMediaStatus;
}

export interface YoutubeStatusWebsocketEvent extends BaseWebsocketEvent {
  type: "youtube-status";
  data: YoutubePlayerStatus;
}

export type WebsocketEvent =
  | MediaWebsocketEvent
  | VlcStatusWebsocketEvent
  | YoutubeStatusWebsocketEvent;
