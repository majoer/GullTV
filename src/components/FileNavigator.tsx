import { useMemo } from "react";
import type { Media } from "../../domain/media";
import { File } from "./File";

export interface FileNavigatorProps {
  isPending: boolean;
  isPlaying: boolean;
  playingFilename?: string;
  allFiles: Media[];
}

export const FileNavigator = (props: FileNavigatorProps) => {
  const { isPlaying, isPending, playingFilename, allFiles } = props;
  const hasLoadedFile = useMemo(
    () => !!allFiles.find((f) => f.name === playingFilename),
    [allFiles, playingFilename]
  );

  if (isPending) {
    return (
      <div className="animate-fadein-slow">
        <svg
          className="animate-spin absolute left-1/2 top-1/2 -translate-1/2 fill-sky-100"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="inherit"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 3.75C7.44365 3.75 3.75 7.44365 3.75 12C3.75 15.5909 6.04464 18.6478 9.24993 19.7808C10.1091 20.0844 11.0344 20.25 12 20.25C12.4142 20.25 12.75 20.5858 12.75 21C12.75 21.4142 12.4142 21.75 12 21.75C10.8618 21.75 9.76756 21.5546 8.75007 21.195C4.9642 19.8569 2.25 16.2464 2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C16.2464 2.25 19.8569 4.9642 21.195 8.75007C21.5546 9.76756 21.75 10.8618 21.75 12C21.75 12.4142 21.4142 12.75 21 12.75C20.5858 12.75 20.25 12.4142 20.25 12C20.25 11.0344 20.0844 10.1091 19.7808 9.24993C18.6478 6.04464 15.5909 3.75 12 3.75Z"
            fill="inherit"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 animate-fadein-fast">
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
