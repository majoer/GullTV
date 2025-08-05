import { diff } from "deep-diff";
import { defer, interval, map, Observable, switchMap, tap } from "rxjs";
import {
  TrackedVlcMediaStatus,
  VlcMediaStatus,
} from "../../domain/vlc-media-status";
import { runVlcCommand } from "./vlc-http-service";

export const VlcObserver = (): Observable<TrackedVlcMediaStatus> => {
  const vlcStatus = observeVlc();
  let previousStatus: VlcMediaStatus | undefined;

  function observeVlc(): Observable<TrackedVlcMediaStatus> {
    return interval(1000).pipe(
      switchMap(() =>
        defer(() => runVlcCommand<VlcMediaStatus>("status.json"))
      ),
      map((response) => response.data),
      map<VlcMediaStatus, TrackedVlcMediaStatus>((status) => ({
        data: status,
        changes: previousStatus ? diff(previousStatus, status) : undefined,
      })),
      tap((result) => (previousStatus = result.data))
    );
  }

  return vlcStatus;
};
