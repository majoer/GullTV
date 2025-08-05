import { useMemo } from "react";
import type { Media } from "../../domain/media";
import { File } from "./File";

export interface FileNavigatorProps {
  isPlaying: boolean;
  playingFilename?: string;
  allFiles: Media[];
}

export const FileNavigator = (props: FileNavigatorProps) => {
  const { isPlaying, playingFilename, allFiles } = props;
  const hasLoadedFile = useMemo(
    () => !!allFiles.find((f) => f.name === playingFilename),
    [allFiles, playingFilename]
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      {allFiles.map((file) => (
        <File
          isPlaying={isPlaying}
          hasLoadedFileInParent={hasLoadedFile}
          playingFilename={playingFilename}
          key={file.name}
          file={file}
          allFiles={allFiles}
        ></File>
      ))}
    </div>
  );
};
