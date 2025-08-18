export interface YoutubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: PageInfo;
  items: YoutubeSearchItem[];
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YoutubeSearchItem {
  kind: string;
  etag: string;
  id: VideoId;
  snippet: Snippet;
}

export interface VideoId {
  kind: string;
  videoId: string;
}

export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}

export interface Thumbnails {
  default: ThumbnailDetails;
  medium: ThumbnailDetails;
  high: ThumbnailDetails;
}

export interface ThumbnailDetails {
  url: string;
  width: number;
  height: number;
}

export interface YoutubePlayerStatus {
  title: string;
  position: number;
  volume: number;
  muted: boolean;
  state: "paused" | "playing" | "stopped";
  duration: number;
  subtitles: { id: string; name: string }[];
  fullscreen: boolean;
}

export type YoutubeAction =
  | "play"
  | "pause"
  | "resume"
  | "setVolume"
  | "seek"
  | "next"
  | "prev";

export interface BaseYoutubeCommand {
  action: YoutubeAction;
}

export interface SimpleYoutubeCommand extends BaseYoutubeCommand {
  action: YoutubeAction;
  hasPayload: false;
}

export interface BaseYoutubeCommandWithPayload<T> extends BaseYoutubeCommand {
  data: T;
  hasPayload: true;
}

export interface YoutubePlayCommand
  extends BaseYoutubeCommandWithPayload<string> {
  action: "play";
}

export interface YoutubePauseCommand extends SimpleYoutubeCommand {
  action: "pause";
}

export interface YoutubeResumeCommand extends SimpleYoutubeCommand {
  action: "resume";
}

export interface YoutubeSeekCommand
  extends BaseYoutubeCommandWithPayload<number> {
  action: "seek";
}

export interface YoutubeSetVolumeCommand
  extends BaseYoutubeCommandWithPayload<number> {
  action: "setVolume";
}

export interface YoutubeNextCommand extends SimpleYoutubeCommand {
  action: "next";
}

export interface YoutubePrevCommand extends SimpleYoutubeCommand {
  action: "prev";
}

export type YoutubeCommand =
  | YoutubePlayCommand
  | YoutubePauseCommand
  | YoutubeResumeCommand
  | YoutubeSeekCommand
  | YoutubeSetVolumeCommand
  | YoutubeNextCommand
  | YoutubePrevCommand;
