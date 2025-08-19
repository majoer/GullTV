import { useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";
import type { WebsocketEvent } from "../../../domain/websocket";
import type {
  YoutubeSearchItem,
  YoutubeSearchResponse,
} from "../../../domain/youtube";
import { YouTube } from "../../api/youtube-api";
import { MediaControlPanel } from "../matsflix/MediaControlPanel";
import { ChipButtonComponent } from "../ui/ChipButtonComponent";
import { SearchInputComponent } from "./SearchInputComponent";

export type ResultMap = {
  videos: YoutubeSearchItem[];
  channels: YoutubeSearchItem[];
  playlists: YoutubeSearchItem[];
};

export const NoobTubeComponent = () => {
  const [searchResult, setSearchResult] = useState<YoutubeSearchResponse>();
  const items = searchResult?.items || [];

  const resultMap = useMemo(
    () =>
      items.reduce<ResultMap>(
        (sum, i) => {
          switch (i.id.kind) {
            case "youtube#video":
              sum.videos.push(i);
              break;
            case "youtube#channel":
              sum.channels.push(i);
              break;
            case "youtube#playlist":
              sum.playlists.push(i);
              break;
          }

          return sum;
        },
        { videos: [], channels: [], playlists: [] }
      ),
    [items]
  );
  const [filter, setFilter] = useState<keyof ResultMap>("videos");

  const { lastJsonMessage: event } = useWebSocket<WebsocketEvent>(
    `ws://${window.location.hostname}:3001`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );
  const status = event?.type === "youtube-status" ? event.data : undefined;

  return (
    <div className="m-auto">
      <SearchInputComponent
        onSearch={async (query) => {
          if (query) {
            setSearchResult(await YouTube.search(query));
          }
        }}
      />

      <div className="flex flex-row flex-nowrap gap-3 mt-3">
        <ChipButtonComponent
          selected={filter === "videos"}
          onClick={() => setFilter("videos")}
        >
          Videos ({resultMap["videos"].length})
        </ChipButtonComponent>
        <ChipButtonComponent
          selected={filter === "channels"}
          onClick={() => setFilter("channels")}
        >
          Channels ({resultMap["channels"].length})
        </ChipButtonComponent>
        <ChipButtonComponent
          selected={filter === "playlists"}
          onClick={() => setFilter("playlists")}
        >
          Playlists ({resultMap["playlists"].length})
        </ChipButtonComponent>
      </div>
      <br />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {resultMap[filter].map((i) => (
          <button
            key={i.etag}
            className="hover:outline-1 outline-sky-100 rounded-md bg-gray-800 text-left"
            onClick={async () => {
              const id = i.id;
              switch (id.kind) {
                case "youtube#video":
                  await YouTube.runCommand({
                    action: "play",
                    hasPayload: true,
                    data: id.videoId,
                  });
                  break;
              }
            }}
          >
            <img
              src={i.snippet.thumbnails.medium.url}
              className="rounded-md w-full"
            />
            <div className="p-2">{i.snippet.title}</div>
          </button>
        ))}
      </div>

      <MediaControlPanel
        time={status?.position || 0}
        length={status?.duration || 0}
        title={status?.title || ""}
        state={status?.state}
        volume={status?.volume ? status.volume * 100 : 0}
        muted={status?.muted || false}
        disabled={false}
        onNext={async () => {
          await YouTube.runCommand({ action: "next", hasPayload: false });
        }}
        onPrev={async () => {
          await YouTube.runCommand({ action: "prev", hasPayload: false });
        }}
        onPause={async () => {
          await YouTube.runCommand({ action: "pause", hasPayload: false });
        }}
        onPlay={async () => {
          await YouTube.runCommand({ action: "resume", hasPayload: false });
        }}
        onSeek={async (data) => {
          await YouTube.runCommand({ action: "seek", hasPayload: true, data });
        }}
        onSetAudioTrack={async () => {}}
        onSetSubtitle={async () => {}}
        onSetVolume={async (data) => {
          await YouTube.runCommand({
            action: "setVolume",
            hasPayload: true,
            data: data / 100,
          });
        }}
      />
    </div>
  );
};
