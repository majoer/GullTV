import type { VlcMediaStatus } from "../../domain/vlc-media-status";
import { seek } from "../api/vlc-api";

export interface SeekProps {
  disabled: boolean;
  status?: VlcMediaStatus;
}

export const Seek = (props: SeekProps) => {
  const position = (props.status?.position || 0) * 100;
  const length = props.status?.length || 0;

  return (
    <div
      className="w-full bg-white rounded-2xl h-2 my-2 relative cursor-pointer"
      onClick={async (e) => {
        const estimatedPosition = Math.round(
          (e.nativeEvent.offsetX / e.currentTarget.clientWidth) * length
        );
        await seek(estimatedPosition);
      }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
        style={{ left: `${position}%` }}
      >
        🟠
      </div>
    </div>
  );
};
