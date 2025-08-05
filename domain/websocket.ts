import type { MediaResponse } from "./media";
import type { TrackedVlcMediaStatus } from "./vlc-media-status";

export type WebsocketEventType = "status" | "media";

export interface BaseWebsocketEvent {
  type: WebsocketEventType;
}

export interface MediaWebsocketEvent extends BaseWebsocketEvent {
  type: "media";
  data: MediaResponse;
}

export interface StatusWebsocketEvent extends BaseWebsocketEvent {
  type: "status";
  data: TrackedVlcMediaStatus;
}

export type WebsocketEvent = MediaWebsocketEvent | StatusWebsocketEvent;
