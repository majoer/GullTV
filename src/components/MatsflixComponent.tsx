import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import type { WebsocketEvent } from "../../domain/websocket";
import { getMedia } from "../api/media-api";
import { BreadcrumbsComponent } from "./Breadcrumbs";
import { FileNavigator } from "./FileNavigator";
import { MediaControlPanel } from "./MediaControlPanel";

export const MatsflixComponent = () => {
  const location = useLocation();

  const {
    isPending,
    data: initialMedia,
    error,
  } = useQuery({
    queryKey: ["media", location.pathname],
    queryFn: () => getMedia(location.pathname),
  });

  const { lastJsonMessage: event } = useWebSocket<WebsocketEvent>(
    `ws://${window.location.hostname}:3001`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  if (error) return <>Error</>;
  if (isPending) return <>Loading ...</>;

  const mediaResponse = event?.type === "media" ? event.data : initialMedia;
  const status = event?.type === "status" ? event.data : undefined;
  const isPlaying = status?.current?.state === "playing";
  const playingFilename = status?.current?.information?.category.meta.filename;

  return (
    <div className="m-auto mb-32">
      <BreadcrumbsComponent />
      <FileNavigator
        playingFilename={playingFilename}
        isPlaying={isPlaying}
        allFiles={mediaResponse.media}
      />
      <MediaControlPanel
        status={status?.current}
        disabled={!status}
        allFiles={mediaResponse.media}
      />
    </div>
  );
};
