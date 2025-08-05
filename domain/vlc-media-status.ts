
export type StreamType = "Video" | "Audio" | "Subtitle";

export interface BaseStream {
  Type: StreamType;
  Language?: string;
  Codec: string;
}

export interface VideoStream extends BaseStream {
  Type: "Video";
  DecodedFormat: string;
  FrameRate: number;
  VideoResolution: string; // e.g. "1920x1080"
  Orientation: string;
  BufferDimensions: string;
  ChromaLocation: string;
}

export interface AudioStream extends BaseStream {
  Type: "Audio";
  BitsPerSample: number;
  Channels: string; // e.g. "Stereo"
  SampleRate: number; // in Hz
}

export interface SubtitleStream extends BaseStream {
  Type: "Subtitle";
  Description?: string;
}

export type MediaStream = VideoStream | AudioStream | SubtitleStream;

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

export type StreamInfo = {
  meta: {
    encoded_by: string;
    filename: string;
  };
} & {
  [key: string]: MediaStream;
};

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
  information?: InformationCategory;
  state: "playing" | "stopped" | "paused";
  repeat: boolean;
  loop: boolean;
  fullscreen: boolean | 0;
}

export interface TrackedVlcMediaStatus {
  current: VlcMediaStatus;
  prev?: VlcMediaStatus;
}
