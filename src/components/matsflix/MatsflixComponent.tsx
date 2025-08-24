import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import type { StreamInfo } from "../../../domain/vlc-media-status";
import type { WebsocketEvent } from "../../../domain/websocket";
import { MediaApi } from "../../api/media-api";
import { VlcApi } from "../../api/vlc-api";
import { FileNavigator } from "./FileNavigator";
import { MediaControlPanel } from "../common/MediaControlPanel";
import { RecentsComponent } from "./RecentsComponent";

export const MatsflixComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const folder = location.pathname.replace("matsflix", "");

  const {
    isPending,
    data: initialMedia,
    error,
  } = useQuery({
    queryKey: ["media", folder],
    queryFn: () => MediaApi.getMedia(folder),
  });

  const { lastJsonMessage: event } = useWebSocket<WebsocketEvent>(
    `ws://${window.location.hostname}:3001`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  if (error) return <>Error</>;

  const mediaResponse = event?.type === "media" ? event.data : initialMedia;
  const vlcStatus = event?.type === "vlc-status" ? event.data : undefined;
  const isPlaying = vlcStatus?.current?.state === "playing";
  const playingFilename =
    vlcStatus?.current?.information?.category.meta.filename;
  const lastWatched = mediaResponse?.lastWatched;

  const category = vlcStatus?.current.information?.category;
  const { meta: _, ...streams } = category || ({} as StreamInfo);
  const allStreams = Object.keys(streams);
  const audioStreams = allStreams
    .filter((s) => streams[s].Type === "Audio")
    .map((s) => ({
      id: s.replace("Stream ", ""),
      label: streams[s].Language!!,
    }));
  const subtitleStreams = allStreams
    .filter((s) => streams[s].Type === "Subtitle")
    .map((s) => ({
      id: s.replace("Stream ", ""),
      label: streams[s].Language!!,
    }));

  return (
    <div className="m-auto mb-32">
      {location.pathname === "/matsflix" ? <RecentsComponent /> : null}

      <FileNavigator
        isPending={isPending}
        playingFilename={playingFilename}
        isPlaying={isPlaying}
        allFiles={mediaResponse?.media ?? []}
      />
      <MediaControlPanel
        state={vlcStatus?.current.state}
        time={vlcStatus?.current.time || 0}
        length={vlcStatus?.current.length || 0}
        volume={vlcStatus?.current.volume ? vlcStatus.current.volume * 0.32 : 0}
        muted={false}
        title={category?.meta.filename || lastWatched?.name || ""}
        audioTracks={audioStreams}
        subtitles={subtitleStreams}
        disabled={!vlcStatus}
        onNext={async () => {
          if (lastWatched) navigate(`/matsflix/${lastWatched.parent}`);

          await VlcApi.next();
        }}
        onPrev={async () => {
          if (lastWatched) navigate(`/matsflix/${lastWatched.parent}`);
          await VlcApi.previous();
        }}
        onPause={async () => {
          if (lastWatched) navigate(`/matsflix/${lastWatched.parent}`);
          await VlcApi.pause();
        }}
        onPlay={async () => {
          if (vlcStatus?.current.information) {
            await VlcApi.resume();
            await VlcApi.fullscreenCheck();
          }
        }}
        onSetVolume={async (v) => {
          await VlcApi.setVolume(Math.round(v * 3.2));
        }}
        onSeek={async (v) => {
          await VlcApi.seek(v);
        }}
        onSetSubtitle={async (language) => {
          await VlcApi.setSubtitle(language);
        }}
        onSetAudioTrack={async (track) => {
          await VlcApi.setAudio(track);
        }}
      />
    </div>
  );
};
