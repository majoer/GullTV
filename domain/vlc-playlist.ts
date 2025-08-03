export interface VlcPlaylistItem {
  type: 'leaf';
  duration: number;
  name: string;
  ro: 'rw' | 'ro';
  uri: string;
  id: string;
}

export interface VlcPlaylistNode {
  type: 'node';
  name: string;
  ro: 'rw' | 'ro';
  id: string;
  children: Array<VlcPlaylistNode | VlcPlaylistItem>;
}

export interface VlcPlaylist extends VlcPlaylistNode {
  children: VlcPlaylistNode[]; // at root, only nodes like "Playlist" and "Media Library"
}