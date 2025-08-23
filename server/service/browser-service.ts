import { ChildProcess, spawn } from "child_process";
import fs from "fs";
import os from "os";
import puppeteer, { Browser, Page } from "puppeteer";
import { FIREFOX_EXECUTABLE as PATH_FIREFOX_EXECUTABLE } from "../installer/installer-constants";
import { logger } from "../logger";
import { defer, firstValueFrom, retry, tap, timer } from "rxjs";
import { Env } from "../environment";

export const FIREFOX_DEBUGGER_PORT = 10000;

export interface BrowserService {
  getPage: () => Page;
  wake: () => Promise<void>;
}

export const BrowserService = (): BrowserService => {
  const userDataDir = getUserDataDir();
  let browserProcess: ChildProcess | undefined;
  let browser: Browser | undefined;
  let page: Page | undefined;

  process.on("SIGUSR2", () => {
    browserProcess?.kill();
  });

  return {
    getPage: () => {
      if (!page) {
        throw Error("Illegal state, page can't be retrieved now");
      }
      return page;
    },
    wake: async () => {
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir);
      }

      if (!browserProcess) {
        browserProcess = await start();
        browserProcess.on("error", (e) => logger.error("Browser error:", e));
        browserProcess.on("exit", () => {
          logger.warn("Browser exited or crashed outside GullTV's control");
          browserProcess = undefined;
          browser = undefined;
          page = undefined;
        });
      }

      if (!browser) {
        browser = await connect();
      }
      const pages = await browser.pages();
      page = pages[0] || (await browser.newPage());
    },
  };
};

export function getUserDataDir() {
  const userDataDir = `${os.homedir}/.gulltv/firefox-profile`;

  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  return userDataDir;
}

async function connect(): Promise<Browser> {
  const browserWSEndpoint = `ws://localhost:${FIREFOX_DEBUGGER_PORT}/session`;
  logger.info(`Connecting to ${browserWSEndpoint}`);

  return firstValueFrom(
    defer(() =>
      puppeteer.connect({
        browserWSEndpoint,
        protocol: "webDriverBiDi",
      })
    ).pipe(
      retry({
        count: 20,
        delay: (error, retryCount) => {
          logger.debug(`Retrying ${retryCount}/20`);
          return timer(300);
        },
      }),
      tap(() => {
        logger.info(`Connected to ${browserWSEndpoint}`);
      })
    )
  );
}

function start(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const process = spawn(
      PATH_FIREFOX_EXECUTABLE,
      [
        `--remote-debugging-port=${FIREFOX_DEBUGGER_PORT}`,
        `--profile`,
        getUserDataDir(),
      ].concat(Env.firefox.disableSandbox ? ["--disable-sandbox"] : []),
      {
        detached: true,
        stdio: "ignore",
      }
    );

    process.on("spawn", () => resolve(process));
    process.on("error", () => reject());
  });
}
