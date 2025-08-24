import dotenv from "dotenv";
import { logger } from "./logger";
import fs from "fs";

interface Env {
  NODE_ENV: string;
  GULLTV_FIREFOX_DISABLE_SANDBOX: boolean;
  GULLTV_MEDIA_DIRECTORY: string;
  GULLTV_YOUTUBE_API_KEY: string;
}

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  const defaultEnv: Omit<Env, "NODE_ENV"> = {
    GULLTV_FIREFOX_DISABLE_SANDBOX: false,
    GULLTV_MEDIA_DIRECTORY: "/mnt/media",
    GULLTV_YOUTUBE_API_KEY: "",
  };
  const toDotenv = (env: Env) =>
    Object.keys(env)
      .map((k) => `${k}=${(env as any)[k]}`)
      .join("\n");

  if (!fs.existsSync(".env.production")) {
    const data = toDotenv({ ...defaultEnv, NODE_ENV: "production" });
    fs.writeFileSync(".env.production", data);
  }

  if (!fs.existsSync(".env")) {
    const data = toDotenv({ ...defaultEnv, NODE_ENV: "development" });
    fs.writeFileSync(".env", data);
  }
}

dotenv.config({ quiet: true });

export const Env: Env & { isProduction: boolean } = {
  NODE_ENV: e("NODE_ENV"),
  GULLTV_FIREFOX_DISABLE_SANDBOX:
    e("GULLTV_FIREFOX_DISABLE_SANDBOX") === "true",
  GULLTV_MEDIA_DIRECTORY: e("GULLTV_MEDIA_DIRECTORY"),
  GULLTV_YOUTUBE_API_KEY: e("GULLTV_YOUTUBE_API_KEY"),
  isProduction,
};

logger.info(`Env loaded. production: ${Env.isProduction}`);

function e(key: string): string {
  const env = process.env[key];
  if (env === undefined || env === null || env === "") {
    throw Error(`Cant find required Env variable: ${key}`);
  }
  return env;
}
