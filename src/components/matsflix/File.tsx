import type { Media } from "../../../domain/media";
import { VlcApi } from "../../api/vlc-api";
import { Icon } from "../ui/Icon";
import { NavLinkComponent } from "../ui/NavLinkComponent";

export interface FileProps {
  file: Media;
  allFiles: Media[];
  isPlaying: boolean;
  hasLoadedFileInParent: boolean;
  playingFilename?: string;
}

export const File = (props: FileProps) => {
  const { isPlaying, hasLoadedFileInParent, file } = props;
  const fileIsLoaded = props.playingFilename === file.name;
  const leftOff = !file.isDirectory && file.viewProgress;

  return (
    <>
      <NavLinkComponent
        className={`relative m-2 p-2 bg-gray-800 rounded-md overflow-clip`}
        to={`/matsflix/${file.path}`}
        onClick={async (e) => {
          if (!props.file.isDirectory) {
            e.preventDefault();

            await VlcApi.createPlaylistAndPlay(props.allFiles, props.file);
            await VlcApi.fullscreenCheck();
          }
        }}
      >
        <div className="flex justify-between items-center">
          <div className="break-all">{props.file.name}</div>
          {props.file.isDirectory ? (
            <Icon.FOLDER className="shrink-0 fill-sky-100" />
          ) : (
            <Icon.PLAY
              className={`shrink-0 ${
                isPlaying && fileIsLoaded ? "animate-pulse" : ""
              } ${
                fileIsLoaded
                  ? "fill-green-500"
                  : leftOff && !hasLoadedFileInParent
                  ? "fill-yellow-400"
                  : "fill-orange-500"
              }`}
            />
          )}
        </div>
      </NavLinkComponent>
    </>
  );
};
