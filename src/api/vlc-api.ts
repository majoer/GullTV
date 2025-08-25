import type { Media } from "../../domain/media";
import type { VlcMediaStatus } from "../../domain/vlc-media-status";
import type { VlcPlaylist } from "../../domain/vlc-playlist";

export const VlcApi = {
  async getStatus(): Promise<VlcMediaStatus> {
    return (await fetch("/api/vlc/status.json")).json();
  },

  async toggleFullscreen(): Promise<VlcMediaStatus> {
    return (await fetch("/api/vlc/status.json?command=fullscreen")).json();
  },

  async emptyPlaylist(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/status.json?command=pl_empty`)).json();
  },

  async addToPlaylist(uri: string): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=in_enqueue&input=${uri}`)
    ).json();
  },

  async getPlaylist(): Promise<VlcPlaylist> {
    return (await fetch(`/api/vlc/playlist.json`)).json();
  },

  async playPlaylistItem(id: string): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=pl_play&id=${id}`)
    ).json();
  },

  async next(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/status.json?command=pl_next`)).json();
  },

  async previous(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/status.json?command=pl_previous`)).json();
  },

  async play(uri: string): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=in_play&input=${uri}`)
    ).json();
  },

  async pause(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/status.json?command=pl_forcepause`)).json();
  },

  async resume(): Promise<VlcMediaStatus> {
    return (await fetch(`/api/vlc/status.json?command=pl_forceresume`)).json();
  },

  async seek(value: string | number): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=seek&val=${value}`)
    ).json();
  },

  async setAudio(value: string | number): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=audio_track&val=${value}`)
    ).json();
  },

  async setVolume(value: string | number): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=volume&val=${value}`)
    ).json();
  },

  async setSubtitle(value: string | number): Promise<VlcMediaStatus> {
    return (
      await fetch(`/api/vlc/status.json?command=subtitle_track&val=${value}`)
    ).json();
  },

  async createPlaylistAndPlay(
    files: Media[],
    file: Media
  ): Promise<VlcMediaStatus> {
    await this.emptyPlaylist();

    for (const f of files.filter((f) => !f.isDirectory)) {
      await this.addToPlaylist(f.path);
    }

    const playlist = await this.getPlaylist();
    const item = playlist.children
      .find((c) => c.name === "Playlist")
      ?.children.filter((c) => c.type === "leaf")
      .find((c) => decodeURIComponent(c.uri).endsWith(file.path))

    if (item) {
      return await this.playPlaylistItem(item.id);
    } else {
      console.error("Unable to find item in playlist, using fallback");
      return await this.play(file.path);
    }
  },

  async fullscreenCheck(max: number | undefined = 10) {
    const status = await this.getStatus();

    if (status.fullscreen === 0 && max > 0) {
      await delay(100);
      await this.fullscreenCheck(--max);
    } else if (!status.fullscreen) {
      await this.toggleFullscreen();
    }
  },
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}
