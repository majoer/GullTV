import chalk from "chalk";
import express from "express";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { AppManager } from "./app-manager";
import { logger } from "./logger";
import { GullTvInstaller } from "./installer/gulltv-installer";

const port = 3000;
const wsPort = 3001;
const app = express();
const wss = new WebSocketServer({ port: wsPort });

const appManager = AppManager(wss);
const { mediaService, youtubeService } = appManager;

wss.on("connection", (socket: WebSocket) => {
  logger.info("Websocket connected");

  socket.on("close", () => {
    logger.info("Websocket disconnected");
  });
});

app.get("/api/vlc/{*vlcPath}", async (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));

  const command = `${req.url.replace("/api/vlc/", "")}`;
  const result = await appManager.onVlcCommand(command);

  res.status(result.status).json(result.data);
});

app.get("/api/media", async (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const folder = decodeURIComponent(req.query["folder"] as string) || "";

  const media = await mediaService.getMedia(folder);
  res.status(200).json(media);
});

app.get("/api/youtube/search", async (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const q = decodeURIComponent(req.query["q"] as string) || "";

  res.status(200).json(await youtubeService.search(q));
});

app.get("/api/youtube/play", async (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const id: string = req.query["id"] as string;

  if (!id) {
    logger.error("Missing youtube ID");
    res.status(404);
  } else {
    res
      .status(200)
      .json(await appManager.onYoutubeCommand({ action: "play", data: id }));
  }
});

app.use(express.static("dist/client"));
app.get("{*all}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

const server = app.listen(port, (error) => {
  if (error) {
    logger.error(error);
  } else {
    logger.info(`Express started on ${port}`);
  }
});

process.on("SIGUSR2", () => {
  logger.info("Disconnecting servers");
  server.close();
  wss.close();
});
