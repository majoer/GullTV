import fs from "fs";
import { ViewProgress, ViewProgressFile } from "../../domain/progress";

const progressFilePath = "/tmp/matsflix-view-progress.json";

export interface ViewProgressService {
  getProgress: () => ViewProgress;
  saveProgress: (
    parentPath: string,
    viewProgress: ViewProgressFile
  ) => Promise<void>;
}

export const ViewProgressService = (): ViewProgressService => {
  const cache: ViewProgress = readProgress();

  return {
    getProgress: (): ViewProgress => {
      return cache;
    },
    saveProgress: async (
      parentPath: string,
      viewProgress: ViewProgressFile
    ) => {
      cache[parentPath] = viewProgress;
      fs.writeFileSync(progressFilePath, JSON.stringify(cache));
    },
  };
};

function readProgress(): ViewProgress {
  try {
    return JSON.parse(fs.readFileSync(progressFilePath, "utf-8"));
  } catch (_) {
    return {};
  }
}
