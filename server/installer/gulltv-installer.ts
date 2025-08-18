import { existsSync, mkdirSync } from "fs";
import { logger } from "../logger";
import { FirefoxInstaller } from "./firefox-installer";
import { PATH_GULLTV } from "./installer-constants";

export const GullTvInstaller = () => {
  const firefoxInstaller = FirefoxInstaller();

  return {
    install: async () => {
      if (!existsSync(PATH_GULLTV)) {
        logger.info(`Creating folder ${PATH_GULLTV}`);
        mkdirSync(PATH_GULLTV, { recursive: true });
      }

      await firefoxInstaller.install();
      logger.info("GullTV installed");
    },
  };
};
