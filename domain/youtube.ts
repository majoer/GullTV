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
  state: "paused" | "playing" | "stopped";
  duration: number;
  subtitles: { id: string; name: string }[];
  fullscreen: boolean;
}
