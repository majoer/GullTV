export interface ViewProgress {
  [key: string]: ViewProgressFile;
}

export interface ViewProgressFile {
  filename: string;
  position: number;
}
