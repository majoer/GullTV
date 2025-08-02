import { NavLink } from "react-router-dom";
import type { Media } from "../../domain/media";
import { play } from "../api/vlc-api";

export interface FileProps {
  file: Media;
}

export const File = (props: FileProps) => {
  return (
    <>
      {props.file.isDirectory ? (
        <NavLink
          className="m-2 p-2 border-2"
          to={`${props.file.parent}/${props.file.name}`}
        >
          {props.file.name}
        </NavLink>
      ) : (
        <button
          className="m-2 p-2 border-2"
          onClick={async () => {
            await play(props.file.path)
          }}
        >
          {props.file.name}
        </button>
      )}
    </>
  );
};
