import type { Media } from "../../domain/media";
import type { VlcMediaStatus } from "../../domain/vlc-media-status";
import type { VlcPlaylist } from "../../domain/vlc-playlist";

export async function getStatus(): Promise<VlcMediaStatus> {
  return (await fetch("/api/vlc/status.json")).json();
}

export async function toggleFullscreen(): Promise<VlcMediaStatus> {
  return (
    await fetch("/api/vlc/status.json?command=fullscreen")
  ).json();
}

export async function emptyPlaylist(): Promise<VlcMediaStatus> {
  return (await fetch(`/api/vlc/status.json?command=pl_empty`)).json();
}

export async function addToPlaylist(uri: string): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=in_enqueue&input=${uri}`)
  ).json();
}

export async function getPlaylist(): Promise<VlcPlaylist> {
  return (await fetch(`/api/vlc/playlist.json`)).json();
}

export async function playPlaylistItem(id: string): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=pl_play&id=${id}`)
  ).json();
}

export async function next(): Promise<VlcMediaStatus> {
  return (await fetch(`/api/vlc/status.json?command=pl_next`)).json();
}

export async function previous(): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=pl_previous`)
  ).json();
}

export async function play(uri: string): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=in_play&input=${uri}`)
  ).json();
}

export async function pause(): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=pl_forcepause`)
  ).json();
}

export async function resume(): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=pl_forceresume`)
  ).json();
}

export async function seek(value: string | number): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/status.json?command=seek&val=${value}`)
  ).json();
}
export async function setAudio(
  value: string | number
): Promise<VlcMediaStatus> {
  return (
    await fetch(
      `/api/vlc/status.json?command=audio_track&val=${value}`
    )
  ).json();
}
export async function setVolume(
  value: string | number
): Promise<VlcMediaStatus> {
  return (
    await fetch(
      `/api/vlc/status.json?command=volume&val=${value}`
    )
  ).json();
}
export async function setSubtitle(
  value: string | number
): Promise<VlcMediaStatus> {
  return (
    await fetch(
      `/api/vlc/status.json?command=subtitle_track&val=${value}`
    )
  ).json();
}

export async function createPlaylistAndPlay(
  files: Media[],
  file: Media
): Promise<VlcMediaStatus> {
  await emptyPlaylist();

  for (const file of files.filter((f) => !f.isDirectory)) {
    await addToPlaylist(file.path);
  }

  const playlist = await getPlaylist();
  const item = playlist.children[0]?.children
    .filter((c) => c.type === "leaf")
    .find((c) => c.name === file.name);

  if (item) {
    return await playPlaylistItem(item?.id);
  } else {
    console.error("Unable to find item in playlist, using fallback");
    return await play(file.path);
  }
}

export async function fullscreenCheck(max: number | undefined = 10) {
  const status = await getStatus();

  if (status.fullscreen === 0 && max > 0) {
    await delay(100);
    await fullscreenCheck(--max);
  } else if (!status.fullscreen) {
    await toggleFullscreen();
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
