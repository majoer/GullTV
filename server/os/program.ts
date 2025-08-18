import { exec } from "child_process";

export const Program = {
  bringToFront: (window: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      exec(`wmctrl -a '${window}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  },
};
