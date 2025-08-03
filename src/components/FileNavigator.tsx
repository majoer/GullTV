import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getMedia } from "../api/media-api";
import { File } from "./File";

export interface FileNavigatorProps {
  playingFilename?: string;
}

export const FileNavigator = (props: FileNavigatorProps) => {
  const location = useLocation();

  const {
    isPending,
    data: files,
    error,
  } = useQuery({
    queryKey: ["media", location.pathname],
    queryFn: () => getMedia(location.pathname),
  });

  if (error) return <>Error</>;
  if (isPending) return <>Loading ...</>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      {files.media.map((file) => (
        <File playingFilename={props.playingFilename} key={file.name} file={file} allFiles={files.media}></File>
      ))}
    </div>
  );
};
