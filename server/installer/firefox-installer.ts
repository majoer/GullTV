import { execSync } from "child_process";
import { createWriteStream, existsSync } from "fs";
import https from "https";
import os from "os";
import path from "path";
import { logger } from "../logger";
import { FIREFOX_EXECUTABLE, PATH_GULLTV } from "./installer-constants";

const FIREFOX_LOCATION = path.join(PATH_GULLTV, "firefox");
const DOWNLOAD_TMP_PATH = "/tmp/firefox-mats-tv.tar.xz";

export const FirefoxInstaller = () => {
  return {
    install: async () => {
      if (isInstalled()) {
        logger.info("GullTV Firefox already installed");
        return;
      }

      logger.info("Installing GullTV");
      await downloadFirefox();
      extractToFirefoxLocation();
      prepareFirefox();

      logger.info("Firefox installed");
    },
  };
};

function isInstalled() {
  return existsSync(FIREFOX_EXECUTABLE);
}

function prepareFirefox() {
  execSync(
    `sed -i 's/webdriver/aaaaaaaaa/g' ${path.join(
      FIREFOX_LOCATION,
      "libxul.so"
    )}`
  );
}

function extractToFirefoxLocation() {
  execSync(`tar -xf ${DOWNLOAD_TMP_PATH} -C ${PATH_GULLTV}`);
  logger.info(`Extracted ${DOWNLOAD_TMP_PATH} to ${FIREFOX_LOCATION}`);
}

async function downloadFirefox(): Promise<void> {
  const downloadUrl = await getDownloadUrlForCurrentVersion();
  return new Promise((resolve, reject) => {
    const file = createWriteStream(DOWNLOAD_TMP_PATH);

    logger.info(`Downloading firefox to ${DOWNLOAD_TMP_PATH}`);
    logger.info(`GET ${downloadUrl}`);

    https.get(downloadUrl, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        logger.info("Download complete");
        resolve();
      });
    });
  });
}

async function getDownloadUrlForCurrentVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    const downloadUrl = getDownloadUrl();

    https.get(downloadUrl, (res) => {
      if (!res.headers.location) {
        logger.error(`Expected a location header from ${downloadUrl}`);
        reject();
      } else {
        resolve(res.headers.location);
      }
    });
  });
}

function getDownloadUrl(): string {
  switch (`${os.arch()}-${os.platform()}`) {
    case "arm64-linux":
      return "https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64-aarch64&lang=en-US";
    case "x64-linux":
      return "https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US";
    default:
      throw Error(`Unsupported platform ${os.arch}-${os.platform()}`);
  }
}
