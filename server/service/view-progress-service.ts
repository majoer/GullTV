import fs from "fs";
import path from 'path'
import { ViewProgress, ViewProgressFile } from "../../domain/progress";
import { PATH_GULLTV } from "../installer/installer-constants";

const progressFilePath = path.join(PATH_GULLTV, "matsflix-view-progress.json");

export interface ViewProgressService {
  getProgressState: () => ViewProgress;
  saveProgress: (
    parentPath: string,
    viewProgress: ViewProgressFile
  ) => Promise<void>;
}

export const ViewProgressService = (): ViewProgressService => {
  let progress: ViewProgress = readProgress();

  return {
    getProgressState: (): ViewProgress => {
      return progress;
    },
    saveProgress: async (
      relativeParentPath: string,
      viewProgress: ViewProgressFile
    ) => {
      progress.lastWatched = {
        name: viewProgress.filename,
        path: `${relativeParentPath}/${viewProgress.filename}`,
        parent: relativeParentPath,
        isDirectory: false,
      };
      progress.progressMap[relativeParentPath] = viewProgress;
      fs.writeFileSync(progressFilePath, JSON.stringify(progress));
    },
  };
};

function readProgress(): ViewProgress {
  try {
    const progress = JSON.parse(fs.readFileSync(progressFilePath, "utf-8"));
    return progress;
  } catch (_) {
    return {
      lastWatched: undefined,
      progressMap: {},
    };
  }
}
