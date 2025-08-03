import { useEffect } from "react";
import type { VlcMediaStatus } from "../../domain/vlc-media-status";
import { pause, resume, toggleFullscreen } from "../api/vlc-api";
import { MediaButtonComponent } from "./ui/MediaButtonComponent";
import { Seek } from "./Seek";

export interface MediaControlPanelProps {
  status?: VlcMediaStatus;
  disabled: boolean;
}

export const MediaControlPanel = (props: MediaControlPanelProps) => {
  const { status, disabled } = props;

  useEffect(() => {
    if (status?.fullscreen === false && status?.state === "playing") {
      toggleFullscreen().then();
    }
  }, [status]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full h-28 bg-black text-center">
      <div className="m-4">
        <Seek disabled={disabled} status={status}></Seek>
      </div>

      <div className="flex flex-nowrap w-full justify-between">
        <MediaButtonComponent disabled={disabled} aria-label="previous">
          <svg
            viewBox="0 0 24 24"
            fill="inherit"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4 6.25C3.58579 6.25 3.25 6.58579 3.25 7V17C3.25 17.4142 3.58579 17.75 4 17.75C4.41421 17.75 4.75 17.4142 4.75 17V7C4.75 6.58579 4.41421 6.25 4 6.25ZM13.75 9.31371L11.9828 10.576C11.5229 10.9045 11.25 11.4348 11.25 12C11.25 12.5652 11.5229 13.0955 11.9828 13.424L13.75 14.6863V17C13.75 17.2809 13.593 17.5383 13.3432 17.6669C13.0934 17.7954 12.7927 17.7736 12.5641 17.6103L5.56407 12.6103C5.36697 12.4695 5.25 12.2422 5.25 12C5.25 11.7578 5.36697 11.5305 5.56407 11.3897L12.5641 6.3897C12.7927 6.22641 13.0934 6.20457 13.3432 6.33313C13.593 6.46168 13.75 6.71906 13.75 7V9.31371ZM19.5641 6.3897C19.7927 6.22641 20.0934 6.20457 20.3432 6.33313C20.593 6.46168 20.75 6.71906 20.75 7V17C20.75 17.2809 20.593 17.5383 20.3432 17.6669C20.0934 17.7954 19.7927 17.7736 19.5641 17.6103L12.5641 12.6103C12.367 12.4695 12.25 12.2422 12.25 12C12.25 11.7578 12.367 11.5305 12.5641 11.3897L19.5641 6.3897Z"
              fill="inherit"
            />
          </svg>
        </MediaButtonComponent>

        {status?.state === "playing" ? (
          <MediaButtonComponent
            aria-label="pause"
            disabled={disabled}
            onClick={async () => {
              await pause();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="inherit"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7 6.25C6.58579 6.25 6.25 6.58579 6.25 7V17C6.25 17.4142 6.58579 17.75 7 17.75H10C10.4142 17.75 10.75 17.4142 10.75 17V7C10.75 6.58579 10.4142 6.25 10 6.25H7ZM14 6.25C13.5858 6.25 13.25 6.58579 13.25 7V17C13.25 17.4142 13.5858 17.75 14 17.75H17C17.4142 17.75 17.75 17.4142 17.75 17V7C17.75 6.58579 17.4142 6.25 17 6.25H14Z"
                fill="inherit"
              />
            </svg>
          </MediaButtonComponent>
        ) : (
          <MediaButtonComponent
            aria-label="resume"
            disabled={disabled}
            onClick={async () => {
              await resume();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="inherit"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.61965 6.3536C8.84869 6.21883 9.13193 6.21533 9.36423 6.34438L18.3642 11.3444C18.6023 11.4767 18.75 11.7276 18.75 12C18.75 12.2724 18.6023 12.5233 18.3642 12.6556L9.36423 17.6556C9.13193 17.7847 8.84869 17.7812 8.61965 17.6464C8.39062 17.5116 8.25 17.2657 8.25 17V7C8.25 6.73426 8.39062 6.48836 8.61965 6.3536Z"
                fill="inherit"
              />
            </svg>
          </MediaButtonComponent>
        )}

        <MediaButtonComponent disabled={disabled} aria-label="next">
          <svg
            viewBox="0 0 24 24"
            fill="inherit"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20 6.25C20.4142 6.25 20.75 6.58579 20.75 7V17C20.75 17.4142 20.4142 17.75 20 17.75C19.5858 17.75 19.25 17.4142 19.25 17V7C19.25 6.58579 19.5858 6.25 20 6.25ZM10.3547 14.6115C10.289 14.6585 10.25 14.7342 10.25 14.815V17C10.25 17.2809 10.407 17.5383 10.6568 17.6669C10.9066 17.7954 11.2073 17.7736 11.4359 17.6103L18.4359 12.6103C18.633 12.4695 18.75 12.2422 18.75 12C18.75 11.7578 18.633 11.5305 18.4359 11.3897L11.4359 6.3897C11.2073 6.22641 10.9066 6.20457 10.6568 6.33313C10.407 6.46168 10.25 6.71906 10.25 7V9.18506C10.25 9.2658 10.289 9.34156 10.3547 9.38849L12.0172 10.576C12.4771 10.9045 12.75 11.4348 12.75 12C12.75 12.5652 12.4771 13.0955 12.0172 13.424L10.3547 14.6115ZM4.43593 6.3897C4.20732 6.22641 3.90662 6.20457 3.65681 6.33313C3.40701 6.46168 3.25 6.71906 3.25 7V17C3.25 17.2809 3.40701 17.5383 3.65681 17.6669C3.90662 17.7954 4.20732 17.7736 4.43593 17.6103L11.4359 12.6103C11.633 12.4695 11.75 12.2422 11.75 12C11.75 11.7578 11.633 11.5305 11.4359 11.3897L4.43593 6.3897Z"
              fill="inherit"
            />
          </svg>
        </MediaButtonComponent>
      </div>
    </footer>
  );
};
