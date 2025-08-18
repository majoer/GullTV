import { exec } from "child_process";

export const Keyboard = {
  press: async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      exec(`xdotool key '${key}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  },
};
