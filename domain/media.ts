
export interface MediaResponse {
  media: Media[];
}

export interface Media {
  name: string;
  path: string;
  parent: string;
  isDirectory: boolean;
}
