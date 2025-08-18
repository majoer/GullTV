import type {
  YoutubeCommand,
  YoutubeSearchResponse,
} from "../../domain/youtube";

export const YouTube = {
  search: async (query: string): Promise<YoutubeSearchResponse> => {
    return fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`).then(
      (r) => r.json()
    );
  },

  runCommand: async (command: YoutubeCommand): Promise<void> => {
    const qparams = [`action=${command.action}`];

    if (command.hasPayload) {
      qparams.push(`data=${command.data}`);
    }

    return fetch(`/api/youtube/command?${qparams.join("&")}`).then((r) =>
      r.json()
    );
  },
};
