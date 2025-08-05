import { exec, spawn } from "child_process";
import { logger, vlcLogger } from "../logger";

export const startVlc = () => {
  const process = spawn("vlc", [
    "--extraintf=luaintf",
    "--lua-intf=http",
    "--http-password=mats",
  ]);
  process.stdout.on("data", (data) => vlcLogger.info(data));
  process.stderr.on("data", (data) => vlcLogger.error(data));
  process.on("spawn", () => focusVlc());
  process.on("error", (e) => logger.error(e));

  process.on("close", (code) => {
    logger.info(`VLC exited with code: ${code}`);
  });

  function focusVlc() {
    exec("wmctrl -a 'VLC media player'", (error, stdout, stderr) => {
      if (error) {
        logger.error(error);
        return;
      }
      vlcLogger.info(stdout);
      vlcLogger.error(stderr);
    });
  }
};
