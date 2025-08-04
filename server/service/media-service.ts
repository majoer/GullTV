import fs from "fs/promises";
import path from "path";
import { DirectoryMedia, FileMedia, MediaResponse } from "../../domain/media";
import { ViewProgressService } from "./view-progress-service";

const rootDir = process.env.MEDIA_DIRECTORY || "/home/mats/media";

export interface MediaService {
  getMedia: (folder: string) => Promise<MediaResponse>;
}

export const MediaService = (
  viewProgressService: ViewProgressService
): MediaService => ({
  getMedia: async (folder: string): Promise<MediaResponse> => {
    const folderPath = path.join(rootDir, folder);

    const dir = await fs.readdir(folderPath, {
      recursive: false,
      withFileTypes: true,
    });

    const progress = viewProgressService.getProgress()[folderPath];

    const media = dir.map((file) => {
      const parent = file.parentPath.replace(rootDir + "/", "");
      const path = `${rootDir}/${parent}/${file.name}`;

      if (file.isDirectory()) {
        const media: DirectoryMedia = {
          name: file.name,
          parent,
          path,
          parentPath: file.parentPath,
          isDirectory: true,
        };

        return media;
      } else {
        const media: FileMedia = {
          name: file.name,
          path,
          parent,
          parentPath: file.parentPath,
          isDirectory: false,
          viewProgress:
            progress?.filename === file.name ? progress.position : undefined,
        };
        return media;
      }
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
