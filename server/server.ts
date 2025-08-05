import express from "express";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { createEventEmitter } from "./service/event-emitter";
import { MediaFileService } from "./service/media-file-service";
import { ViewProgressService } from "./service/view-progress-service";
import { runVlcCommand as vlcRequest } from "./service/vlc-http-service";
import { startVlc } from "./service/vlc-process-manager";
import { bindWebsockets } from "./service/web-socket-binder";
import { logger } from "./logger";
import chalk from "chalk";

const port = 3000;
const wsPort = 3001;
const app = express();
const wss = new WebSocketServer({ port: wsPort });
const autorunVlc = process.env.AUTORUN_VLC === "true";

if (autorunVlc) startVlc();
const viewProgressService = ViewProgressService();
const mediaService = MediaFileService(viewProgressService);
const eventEmitter = createEventEmitter(viewProgressService);
bindWebsockets(wss, eventEmitter);

wss.on("connection", (socket: WebSocket) => {
  logger.info("Websocket connected");

  socket.on("close", () => {
    logger.info("Websocket disconnected");
  });
});

app.get("/api/vlc/{*vlcPath}", async (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));

  const command = `${req.url.replace("/api/vlc/", "")}`;
  const result = await vlcRequest(command);

  res.status(result.status).json(result.data);
});

app.get("/api/media", async (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const folder: string = (req.query["folder"] as string) || "";

  const media = await mediaService.getMedia(folder);
  res.status(200).json(media);
});

app.use(express.static("dist/client"));
app.get("{*all}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.listen(port, (error) => {
  if (error) {
    logger.error(error);
  } else {
    logger.info(`Express started on ${port}`);
  }
});
