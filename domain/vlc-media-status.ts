export interface MediaStats {
  sentbytes: number;
  readpackets: number;
  readbytes: number;
  inputbitrate: number;
  decodedvideo: number;
  sentpackets: number;
  playedabuffers: number;
  demuxdiscontinuity: number;
  demuxreadbytes: number;
  lostabuffers: number;
  demuxreadpackets: number;
  demuxcorrupted: number;
  sendbitrate: number;
  decodedaudio: number;
  displayedpictures: number;
  lostpictures: number;
  demuxbitrate: number;
  averagedemuxbitrate: number;
  averageinputbitrate: number;
}

export interface VideoEffects {
  brightness: number;
  saturation: number;
  hue: number;
  contrast: number;
  gamma: number;
}

export interface StreamInfo {
  [key: string]: {
    [property: string]: string;
  };
}

export interface InformationCategory {
  category: StreamInfo;
  chapter: number;
  title: number;
  titles: any[];
  chapters: any[];
}

export interface VlcMediaStatus {
  currentplid: number;
  audiofilters: Record<string, string>;
  position: number;
  version: string;
  aspectratio: string;
  rate: number;
  apiversion: number;
  length: number;
  audiodelay: number;
  subtitledelay: number;
  time: number;
  random: boolean;
  volume: number;
  stats: MediaStats;
  equalizer: any[];
  videoeffects: VideoEffects;
  information: InformationCategory;
  state: string;
  repeat: boolean;
  loop: boolean;
  fullscreen: boolean;
}