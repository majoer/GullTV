import axios from "axios";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

const vlcTarget = "http://localhost:8080";
let vlc: ChildProcessWithoutNullStreams | undefined;

export const VlcService = () => ({
  runVlcCommand: async (command: string) => {
    if (!vlc) {
      vlc = await startVlc();
    }

    const url = `${vlcTarget}/${command}`;

    console.log(`OUT GET ${url}`);
    return await axios.get(url, {
      insecureHTTPParser: true,
      validateStatus: () => true,
      auth: {
        username: "",
        password: "mats",
      },
    });
  },
});

function startVlc(): Promise<ChildProcessWithoutNullStreams> {
  return new Promise((resolve, reject) => {
    const process = spawn("vlc", [
      "--extraintf=luaintf",
      "--lua-intf=http",
      "--http-password=mats",
    ]);
    process.stdout.on("data", (data) => console.log(`stdout: ${data}`));
    process.stderr.on("data", (data) => console.error(`stderr: ${data}`));
    process.on("spawn", () => resolve(process));
    process.on("error", () => reject());

    process.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      reject();
    });
  });
}
