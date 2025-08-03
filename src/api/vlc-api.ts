import type { VlcMediaStatus } from "../../domain/vlc-media-status";
import type { VlcPlaylist } from "../../domain/vlc-playlist";

export async function getStatus(): Promise<VlcMediaStatus> {
  return (await fetch("/api/vlc/requests/status.json")).json();
}

export async function toggleFullscreen(): Promise<VlcMediaStatus> {
  return (
    await fetch("/api/vlc/requests/status.json?command=fullscreen")
  ).json();
}

export async function emptyPlaylist(): Promise<VlcMediaStatus> {
  return (await fetch(`/api/vlc/requests/status.json?command=pl_empty`)).json();
}

export async function addToPlaylist(uri: string): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=in_enqueue&input=${uri}`)
  ).json();
}

export async function getPlaylist(): Promise<VlcPlaylist> {
  return (await fetch(`/api/vlc/requests/playlist.json`)).json();
}

export async function playPlaylistItem(id: string): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=pl_play&id=${id}`)
  ).json();
}

export async function next(): Promise<VlcMediaStatus> {
  return (await fetch(`/api/vlc/requests/status.json?command=pl_next`)).json();
}

export async function previous(): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=pl_previous`)
  ).json();
}

export async function play(uri: string): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=in_play&input=${uri}`)
  ).json();
}

export async function pause(): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=pl_forcepause`)
  ).json();
}

export async function resume(): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=pl_forceresume`)
  ).json();
}

export async function seek(value: string | number): Promise<VlcMediaStatus> {
  return (
    await fetch(`/api/vlc/requests/status.json?command=seek&val=${value}`)
  ).json();
}
export async function setAudio(
  value: string | number
): Promise<VlcMediaStatus> {
  return (
    await fetch(
      `/api/vlc/requests/status.json?command=audio_track&val=${value}`
    )
  ).json();
}
export async function setSubtitle(
  value: string | number
): Promise<VlcMediaStatus> {
  return (
    await fetch(
      `/api/vlc/requests/status.json?command=subtitle_track&val=${value}`
    )
  ).json();
}
