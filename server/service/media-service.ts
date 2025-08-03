import fs from "fs/promises";
import path from "path";
import { MediaResponse } from "../../domain/media";

const rootDir = process.env.MEDIA_DIRECTORY || "/home/mats/media";

export const MediaService = () => ({
  getMedia: async (folder: string): Promise<MediaResponse> => {
    const folderPath = path.join(rootDir, folder);

    const dir = await fs.readdir(folderPath, {
      recursive: false,
      withFileTypes: true,
    });

    const media = dir.map((file) => {
      const parent = file.parentPath.replace(rootDir + "/", "");

      return {
        name: file.name,
        parent,
        path: `${rootDir}/${parent}/${file.name}`,
        isDirectory: file.isDirectory(),
      };
    });

    media.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }

      return a.name.localeCompare(b.name, "nb", {
        numeric: true,
        sensitivity: "base",
      });
    });

    return {
      media,
    };
  },
});
