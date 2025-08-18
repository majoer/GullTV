import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const Env = {
  media: {
    rootDir: e("MEDIA_DIRECTORY"),
  },
  production: process.env.NODE_ENV === "production",
  youtube: {
    apiKey: e("YOUTUBE_API_KEY"),
  },
};

function e(key: string): string {
  const env = process.env[key];
  if (env === undefined || env === null || env === "") {
    throw Error(`Cant find required Env variable: ${key}`);
  }
  return env;
}
