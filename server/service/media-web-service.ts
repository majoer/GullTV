import fs from "fs/promises";
import path from "path";
import { DirectoryMedia, FileMedia, MediaResponse } from "../../domain/media";
import { ViewProgressService } from "./view-progress-service";
import { Env } from "../environment";

export const MEDIA_ROOT = Env.media.rootDir || "/mnt/gullstore/media";

export interface MediaService {
  getMedia: (folder: string) => Promise<MediaResponse>;
}

export function relativeMediaRoot(absolutePath: string) {
  return absolutePath.replace(MEDIA_ROOT + "/", "");
}

export const MediaFileService = (
  viewProgressService: ViewProgressService
): MediaService => ({
  getMedia: async (folder: string): Promise<MediaResponse> => {
    const folderPath = path.join(MEDIA_ROOT, folder);

    const dir = await fs.readdir(folderPath, {
      recursive: false,
      withFileTypes: true,
    });

    const { progressMap, lastWatched } = viewProgressService.getProgressState();
    const progress = progressMap[relativeMediaRoot(folderPath)];

    const media = dir.map((file) => {
      const relativeParent = relativeMediaRoot(file.parentPath);
      const relativePath = path.join(relativeParent, file.name);

      if (file.isDirectory()) {
        const media: DirectoryMedia = {
          name: file.name,
          path: relativePath,
          parent: relativeParent,
          isDirectory: true,
        };

        return media;
      } else {
        const media: FileMedia = {
          name: file.name,
          path: relativePath,
          parent: relativeParent,
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
      lastWatched,
    };
  },
});
