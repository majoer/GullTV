
export interface MediaResponse {
  media: Media[];
}

export interface BaseMedia {
  name: string;
  path: string;
  parentPath: string;
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
