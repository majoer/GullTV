import type { MediaResponse } from "../../domain/media";
import type { ViewProgress } from "../../domain/progress";

export const MediaApi = {
  getMedia: async (folder: string): Promise<MediaResponse> => {
    return (
      await fetch(`/api/media/files?folder=${encodeURIComponent(folder)}`)
    ).json();
  },
  getViewProgress: async (): Promise<ViewProgress> => {
    return (await fetch(`/api/media/view-progress`)).json();
  },
};
