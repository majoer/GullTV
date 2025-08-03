import { useQuery } from "@tanstack/react-query";
import { getStatus } from "../api/vlc-api";
import { FileNavigator } from "./FileNavigator";
import { MediaControlPanel } from "./MediaControlPanel";

export const MatsflixComponent = () => {
  const {
    isPending,
    data: status,
    isError,
  } = useQuery({
    queryKey: ["status"],
    queryFn: getStatus,
    refetchInterval: 1000,
  });

  const disabled = isPending || !!isError;
  const playingFilename = status?.information?.category.meta.filename;

  return (
    <div className="m-auto mb-28">
      <FileNavigator playingFilename={playingFilename} />
      <MediaControlPanel status={status} disabled={disabled} />
    </div>
  );
};
