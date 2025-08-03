import type { Media } from "../../domain/media";
import { play } from "../api/vlc-api";
import { NavLinkComponent } from "./ui/NavLinkComponent";

export interface FileProps {
  file: Media;
  playingFilename?: string;
}

export const File = (props: FileProps) => {
  const isPlaying = props.playingFilename === props.file.name;
  return (
    <>
      <NavLinkComponent
        className={`relative m-2 p-2 border-2 rounded-md overflow-clip ${
          isPlaying ? "border-orange-500" : ""
        }`}
        to={`${props.file.parent}/${props.file.name}`}
        onClick={async (e) => {
          if (!props.file.isDirectory) {
            e.preventDefault();
            await play(props.file.path);
          }
        }}
      >
        <div className="relative">
          <div className=" overflow-clip mr-6">{props.file.name}</div>
          {props.file.isDirectory ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="absolute right-0 top-1/2 -translate-y-1/2 fill-blue-400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M2.25 6C2.25 5.0335 3.0335 4.25 4 4.25H10C10.9665 4.25 11.75 5.0335 11.75 6V7.25H20.5C21.1904 7.25 21.75 7.80964 21.75 8.5V18.5C21.75 19.1904 21.1904 19.75 20.5 19.75H3.5C2.80964 19.75 2.25 19.1904 2.25 18.5V6Z"
                fill="inherit"
              />
            </svg>
          ) : (
            <svg
              height="38"
              width="38"
              viewBox="0 0 24 24"
              className="absolute -right-1 top-1/2 -translate-y-1/2 fill-orange-500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.61965 6.3536C8.84869 6.21883 9.13193 6.21533 9.36423 6.34438L18.3642 11.3444C18.6023 11.4767 18.75 11.7276 18.75 12C18.75 12.2724 18.6023 12.5233 18.3642 12.6556L9.36423 17.6556C9.13193 17.7847 8.84869 17.7812 8.61965 17.6464C8.39062 17.5116 8.25 17.2657 8.25 17V7C8.25 6.73426 8.39062 6.48836 8.61965 6.3536Z"
                fill="inherit"
              />
            </svg>
          )}
        </div>
      </NavLinkComponent>
    </>
  );
};
