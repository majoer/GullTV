export interface ViewProgressResponse {
  [key: string]: ViewProgress;
}

export interface ViewProgress {
  fileName: string;
  position: number;
}
