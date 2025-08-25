import path from "path";
import os from "os";

export const PATH_GULLTV = path.join(os.homedir(), ".gulltv");
export const PATH_GULLTV_CACHE = path.join(os.homedir(), ".gulltv/cache");
export const FIREFOX_EXECUTABLE = path.join(PATH_GULLTV, "firefox", "firefox");
