import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { YouTube } from "../../api/youtube-api";
import { MediaControlPanel } from "../matsflix/MediaControlPanel";
import useWebSocket from "react-use-websocket";
import type { WebsocketEvent } from "../../../domain/websocket";
import type { YoutubePlayCommand } from "../../../domain/youtube";

export const MatsTubeComponent = () => {
  const [query, setQuery] = useState("heste");
  const { isPending, data, error } = useQuery({
    queryKey: ["youtube", query],
    queryFn: () => YouTube.search(query),
  });

  const { lastJsonMessage: event } = useWebSocket<WebsocketEvent>(
    `ws://${window.location.hostname}:3001`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );
  const status = event?.type === "youtube-status" ? event.data : undefined;

  if (isPending) return <div>Pending</div>;
  if (error) return <div>Error</div>;

  return (
    <div className="m-auto">
      <div className="flex justify-center w-full relative">
        <input
          type="text"
          placeholder="search"
          title="Search"
          className="bg-sky-100 rounded-md grow-1 text-black p-1 px-2"
        ></input>
        <button className="absolute w-6 h-6 right-1 top-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="fill-black absolute left-1/2 top-1/2 -translate-1/2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10.5 3.25C6.49594 3.25 3.25 6.49594 3.25 10.5C3.25 14.5041 6.49594 17.75 10.5 17.75C12.2319 17.75 13.8219 17.1427 15.0689 16.1295L20.4801 21.5407C20.773 21.8336 21.2478 21.8336 21.5407 21.5407C21.8336 21.2478 21.8336 20.773 21.5407 20.4801L16.1295 15.0689C17.1427 13.8219 17.75 12.2319 17.75 10.5C17.75 6.49594 14.5041 3.25 10.5 3.25ZM4.75 10.5C4.75 7.32436 7.32436 4.75 10.5 4.75C13.6756 4.75 16.25 7.32436 16.25 10.5C16.25 13.6756 13.6756 16.25 10.5 16.25C7.32436 16.25 4.75 13.6756 4.75 10.5Z"
              fill="inherit"
            />
          </svg>
        </button>
      </div>
      <br />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {data.items.map((i) => (
          <div
            key={i.id.videoId}
            className="hover:outline-1 outline-sky-100 rounded-md bg-gray-800"
          >
            <img
              src={i.snippet.thumbnails.medium.url}
              className="rounded-md w-full"
              onClick={async () =>
                await YouTube.runCommand({
                  action: "play",
                  hasPayload: true,
                  data: i.id.videoId,
                })
              }
            ></img>
            <div className="p-2">{i.snippet.title}</div>
          </div>
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
