import { useEffect, useState } from "react";
import type { StreamInfo, VlcMediaStatus } from "../../domain/vlc-media-status";
import {
  pause,
  resume,
  setAudio,
  setSubtitle,
  toggleFullscreen,
} from "../api/vlc-api";
import { Seek } from "./Seek";
import { MediaButtonComponent } from "./ui/MediaButtonComponent";
import { PopupComponent } from "./ui/PopupComponent";

export interface MediaControlPanelProps {
  status?: VlcMediaStatus;
  disabled: boolean;
}

export const MediaControlPanel = (props: MediaControlPanelProps) => {
  const { status, disabled } = props;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);

  const category = props.status?.information?.category;
  const { meta: _, ...streams } = category || ({} as StreamInfo);
  const allStreams = Object.keys(streams);
  const audioStreams = allStreams.filter((s) => streams[s].Type === "Audio");
  const subtitleStreams = allStreams.filter(
    (s) => streams[s].Type === "Subtitle"
  );

  useEffect(() => {
    if (status?.fullscreen === false && status?.state === "playing") {
      toggleFullscreen().then();
    }
  }, [status]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full h-28 bg-black flex flex-col">
      <div className="mx-3 text-center">
        <Seek disabled={disabled} status={status}></Seek>
        <div className="text-nowrap overflow-clip" title={category?.meta.filename}>
          {category?.meta.filename}
        </div>
      </div>

      <div className="flex flex-nowrap w-full justify-between">
        <MediaButtonComponent
          disabled={disabled}
          aria-label="captions"
          className="relative"
          onClick={() => {
            setSettingsOpen(!settingsOpen);
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
              d="M9.81438 2.82304C9.89603 2.48676 10.1972 2.25 10.5432 2.25H13.4568C13.8028 2.25 14.104 2.48676 14.1856 2.82304L14.6445 4.71318C14.8619 4.79207 15.0746 4.88038 15.2824 4.97763L16.9574 3.95711C17.2529 3.77706 17.6332 3.82257 17.8779 4.06726L19.9328 6.12213C20.1775 6.36682 20.223 6.74716 20.0429 7.04268L19.0224 8.71767C19.1197 8.9254 19.208 9.13818 19.2869 9.3555L21.177 9.81442C21.5132 9.89607 21.75 10.1972 21.75 10.5432V13.4569C21.75 13.8029 21.5132 14.104 21.177 14.1857L19.2869 14.6446C19.208 14.8619 19.1197 15.0747 19.0224 15.2824L20.0429 16.9574C20.223 17.2529 20.1774 17.6332 19.9328 17.8779L17.8779 19.9328C17.6332 20.1775 17.2528 20.223 16.9573 20.043L15.2824 19.0225C15.0746 19.1197 14.8619 19.208 14.6445 19.2869L14.1856 21.177C14.104 21.5132 13.8029 21.75 13.4568 21.75H10.5432C10.1971 21.75 9.89601 21.5132 9.81436 21.177L9.35545 19.2869C9.13813 19.208 8.92536 19.1197 8.71764 19.0225L7.0427 20.043C6.74718 20.223 6.36683 20.1775 6.12214 19.9328L4.06725 17.8779C3.82256 17.6332 3.77705 17.2529 3.9571 16.9574L4.97759 15.2824C4.88035 15.0747 4.79203 14.8619 4.71314 14.6446L2.82304 14.1857C2.48676 14.104 2.25 13.8029 2.25 13.4569V10.5432C2.25 10.1972 2.48676 9.89607 2.82304 9.81442L4.71314 9.3555C4.79203 9.13818 4.88035 8.92541 4.97759 8.71769L3.95706 7.04268C3.77701 6.74716 3.82252 6.36682 4.06722 6.12212L6.12208 4.06726C6.36677 3.82257 6.74712 3.77706 7.04264 3.95711L8.71764 4.97763C8.92536 4.88039 9.13813 4.79207 9.35545 4.71318L9.81438 2.82304ZM12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25Z"
              fill="inherit"
            />
          </svg>
          <PopupComponent open={settingsOpen}>
            <div className="grid grid-cols-2 gap-2 w-64 text-left">
              <label htmlFor="subtitle">Subtitle: </label>
              <select
                id="subtitle"
                disabled={subtitleStreams.length === 0}
                onChange={async (e) => {
                  await setSubtitle(e.currentTarget.value);
                }}
              >
                {subtitleStreams.map((s) => (
                  <option value={s.replace("Stream ", "")}>
                    {streams[s].Language}
                  </option>
                ))}
              </select>

              <label htmlFor="audio">Audio: </label>
              <select
                id="audio"
                disabled={audioStreams.length === 0}
                onChange={async (e) => {
                  await setAudio(e.target.value);
                }}
              >
                {audioStreams.map((s) => (
                  <option value={s.replace("Stream ", "")}>
                    {streams[s].Language}
                  </option>
                ))}
              </select>
            </div>
          </PopupComponent>
        </MediaButtonComponent>

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
        <MediaButtonComponent
          disabled={disabled}
          aria-label="volume"
          onClick={() => setVolumeOpen(!volumeOpen)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="inherit"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12.75 5.00001C12.75 4.7117 12.5847 4.44892 12.3249 4.32403C12.065 4.19914 11.7566 4.23425 11.5315 4.41436L6.73691 8.25001H3C2.58579 8.25001 2.25 8.58579 2.25 9.00001V15C2.25 15.4142 2.58579 15.75 3 15.75H6.73691L11.5315 19.5857C11.7566 19.7658 12.065 19.8009 12.3249 19.676C12.5847 19.5511 12.75 19.2883 12.75 19V5.00001ZM14.8738 9.05684C14.5808 8.76407 14.1059 8.76428 13.8132 9.05731C13.5204 9.35033 13.5206 9.8252 13.8137 10.118C14.2964 10.6003 14.5938 11.2648 14.5938 12.0001C14.5938 12.7354 14.2964 13.3999 13.8137 13.8823C13.5206 14.175 13.5204 14.6499 13.8132 14.9429C14.1059 15.2359 14.5808 15.2362 14.8738 14.9434C15.6267 14.1912 16.0938 13.1495 16.0938 12.0001C16.0938 10.8507 15.6267 9.80903 14.8738 9.05684ZM15.7102 7.22528C16.0029 6.93226 16.4778 6.93204 16.7708 7.2248C17.9928 8.44566 18.75 10.1351 18.75 12C18.75 13.8648 17.9928 15.5543 16.7708 16.7751C16.4778 17.0679 16.0029 17.0677 15.7102 16.7746C15.4174 16.4816 15.4176 16.0067 15.7106 15.714C16.6625 14.763 17.25 13.4508 17.25 12C17.25 10.5491 16.6625 9.23696 15.7106 8.28594C15.4176 7.99318 15.4174 7.51831 15.7102 7.22528ZM18.892 5.10354C18.599 4.81074 18.1241 4.81088 17.8313 5.10386C17.5385 5.39685 17.5387 5.87172 17.8316 6.16452C19.3265 7.65845 20.2498 9.72066 20.2498 11.9999C20.2498 14.2792 19.3265 16.3414 17.8316 17.8354C17.5387 18.1282 17.5385 18.603 17.8313 18.896C18.1241 19.189 18.599 19.1892 18.892 18.8964C20.6568 17.1326 21.7498 14.6932 21.7498 11.9999C21.7498 9.30669 20.6568 6.86729 18.892 5.10354Z"
              fill="inherit"
            />
          </svg>
          <PopupComponent open={volumeOpen}>
            <div></div>
          </PopupComponent>
        </MediaButtonComponent>
      </div>
    </footer>
  );
};
