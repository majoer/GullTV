import type { YoutubeSearchResponse } from "../../domain/youtube";

export const YouTube = {
  search: async (query: string): Promise<YoutubeSearchResponse> => {
    return fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`).then(
      (r) => r.json()
    );
  },

  play: async (id: string): Promise<void> => {
    return fetch(`/api/youtube/play?id=${id}`).then((r) => r.json());
  },
};
