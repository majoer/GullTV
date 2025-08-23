import { exec } from "child_process";
import { logger } from "../logger";

export const Program = {
  bringToFront: (window: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      exec(`wmctrl -a '${window}'`, (error, stdout, stderr) => {
        if (error) {
          logger.error(error);
          reject(error);
          return;
        }

        resolve();
      });
    });
  },
};
