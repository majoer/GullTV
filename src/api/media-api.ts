import type { MediaResponse } from "../../domain/media";

export const MediaApi = {
  getMedia: async (folder: string): Promise<MediaResponse> => {
    return (
      await fetch(`/api/media?folder=${encodeURIComponent(folder)}`)
    ).json();
  },
};
