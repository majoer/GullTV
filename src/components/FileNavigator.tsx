import type { Media } from "../../domain/media";
import { File } from "./File";

export interface FileNavigatorProps {
  isPlaying: boolean;
  playingFilename?: string;
  allFiles: Media[];
}

export const FileNavigator = (props: FileNavigatorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      {props.allFiles.map((file) => (
        <File
          isPlaying={props.isPlaying}
          playingFilename={props.playingFilename}
          key={file.name}
          file={file}
          allFiles={props.allFiles}
        ></File>
      ))}
    </div>
  );
};
