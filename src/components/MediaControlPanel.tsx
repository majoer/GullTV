import { useQuery } from "@tanstack/react-query";
import { getStatus, pause, resume } from "../api/vlc-api";
import { Button } from "./Button";
import { Seek } from "./Seek";

export const MediaControlPanel = () => {
  const { isPending, data: status, isError } = useQuery({
    queryKey: ["status"],
    queryFn: getStatus,
    refetchInterval: 1000,
  });

  const disabled = isPending || !!isError;

  return (
    <div className="absolute bottom-2 left-0 right-0 text-center">
      <Seek disabled={disabled} status={status}></Seek>
      <Button disabled={disabled}>⏮</Button>

      {status?.state === "playing" ? (
        <Button
          disabled={disabled}
          onClick={async () => {
            await pause();
          }}
        >
          ⏯
        </Button>
      ) : (
        <Button
          disabled={disabled}
          className="-rotate-90"
          onClick={async () => {
            await resume();
          }}
        >
          🔽
        </Button>
      )}

      <Button disabled={disabled}>⏭</Button>
    </div>
  );
};
