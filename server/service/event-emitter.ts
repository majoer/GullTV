import { map, Observable, switchMap } from "rxjs";
import { TrackedVlcMediaStatus } from "../../domain/vlc-media-status";
import { StatusWebsocketEvent, WebsocketEvent } from "../../domain/websocket";
import { ViewProgressService } from "./view-progress-service";
import { getPlaylistItem } from "./vlc-http-service";
import { VlcObserver } from "./vlc-observer";

export const createEventEmitter = (
  viewProgressService: ViewProgressService
): Observable<WebsocketEvent> => {
  async function saveProgressIfPlaying(status: TrackedVlcMediaStatus) {
    const filename = status.current.information?.category.meta.filename;

    if (status.current?.state === "playing" && filename) {
      const item = await getPlaylistItem(filename);
      const parentFolder = item?.uri.split("/").slice(2, -1).join("/");
      if (parentFolder) {
        viewProgressService.saveProgress(decodeURIComponent(parentFolder), {
          position: status.current.position,
          filename: filename,
        });
      }
    }
  }

  return VlcObserver().pipe(
    switchMap((status) => saveProgressIfPlaying(status).then(() => status)),
    map<TrackedVlcMediaStatus, StatusWebsocketEvent>((status) => ({
      data: status,
      type: "status",
    }))
  );
};
