import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import type { VlcMediaStatus } from "../../domain/vlc-media-status";
import { getMedia } from "../api/media-api";
import { BreadcrumbsComponent } from "./Breadcrumbs";
import { FileNavigator } from "./FileNavigator";
import { MediaControlPanel } from "./MediaControlPanel";

export const MatsflixComponent = () => {
  const location = useLocation();

  const {
    isPending,
    data: mediaResponse,
    error,
  } = useQuery({
    queryKey: ["media", location.pathname],
    queryFn: () => getMedia(location.pathname),
  });

  const { lastJsonMessage: status } = useWebSocket<VlcMediaStatus>(
    `ws://${window.location.hostname}:3001`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  if (error) return <>Error</>;
  if (isPending) return <>Loading ...</>;

  const isPlaying = status?.state === "playing";
  const playingFilename = status?.information?.category.meta.filename;

  return (
    <div className="m-auto mb-28">
      <BreadcrumbsComponent />
      <FileNavigator
        playingFilename={playingFilename}
        isPlaying={isPlaying}
        allFiles={mediaResponse.media}
      />
      <MediaControlPanel
        status={status}
        disabled={!status}
        allFiles={mediaResponse.media}
      />
    </div>
  );
};
