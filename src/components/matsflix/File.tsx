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
        <div className="relative">
          <div className=" overflow-clip mr-6">{props.file.name}</div>
          {props.file.isDirectory ? (
            <Icon.FOLDER className="absolute right-0 top-1/2 -translate-y-1/2 fill-sky-100" />
          ) : (
            <Icon.PLAY
              className={`absolute -right-1 top-1/2 -translate-y-1/2 ${
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
