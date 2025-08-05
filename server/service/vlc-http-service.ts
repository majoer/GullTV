import axios, { AxiosResponse } from "axios";
import { VlcPlaylist, VlcPlaylistItem } from "../../domain/vlc-playlist";
import { logger } from "../logger";
import chalk from "chalk";

export const vlcTarget = "http://localhost:8080";

export const runVlcCommand = async <T>(
  operation: string
): Promise<AxiosResponse<T>> => {
  const url = `${vlcTarget}/requests/${operation}`;

  logger.debug(chalk.gray(`GET ${url}`));
  const response = await axios.get(url, {
    insecureHTTPParser: true,
    validateStatus: () => true,
    auth: {
      username: "",
      password: "mats",
    },
  });

  return response;
};

export const getPlaylistItem = async (
  name: string
): Promise<VlcPlaylistItem | undefined> => {
  const playlist = await runVlcCommand<VlcPlaylist>("playlist.json");

  if (playlist.status !== 200) {
    logger.error(
      `Unexpected status from VLC ${playlist.status} - ${playlist.data}`
    );
    return undefined;
  }

  return playlist.data.children[0].children
    .filter((c) => c.type === "leaf")
    .find((c) => c.name === name);
};
