export interface MediaResponse {
  media: Media[];
  lastWatched?: BaseMedia;
}

export interface BaseMedia {
  name: string;
  path: string;
  parent: string;
  isDirectory: boolean;
}

export interface DirectoryMedia extends BaseMedia {
  isDirectory: true;
}

export interface FileMedia extends BaseMedia {
  isDirectory: false;
  viewProgress?: number;
}

export type Media = FileMedia | DirectoryMedia;
