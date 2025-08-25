import { existsSync, mkdirSync } from "fs";
import { logger } from "../logger";
import { FirefoxInstaller } from "./firefox-installer";
import { PATH_GULLTV, PATH_GULLTV_CACHE } from "./installer-constants";

export const GullTvInstaller = () => {
  const firefoxInstaller = FirefoxInstaller();

  return {
    install: async () => {
      [PATH_GULLTV, PATH_GULLTV_CACHE].forEach((folder) => {
        logger.info(`Creating folder ${folder}`);
        mkdirSync(folder, { recursive: true });
      });

      await firefoxInstaller.install();
      logger.info("GullTV installed");
    },
  };
};
