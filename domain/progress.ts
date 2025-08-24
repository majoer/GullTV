import type { BaseMedia } from "./media";

export interface ViewProgress {
  lastWatched?: BaseMedia;
  progressMap: { [key: string]: ViewProgressFile };
}

export interface ViewProgressFile {
  filename: string;
  position: number;
  time: number;
}
