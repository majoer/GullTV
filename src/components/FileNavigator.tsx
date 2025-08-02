import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getMedia } from "../api/media-api";
import { File } from "./File";

export const FileNavigator = () => {
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
    <div className="flex flex-row">
      {files.media.map((file) => (
        <File
          key={file.name}
          file={file}
        ></File>
      ))}
    </div>
  );
};
