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

app.get("/api/vlc/{*vlcPath}", (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));

  const command = `${req.url.replace("/api/vlc/", "")}`;
  appManager
    .onVlcCommand(command)
    .then((result) => res.status(result.status).json(result.data))
    .catch((e) => {
      logger.error(e);
      res.status(500).json({});
    });
});

app.get("/api/media", (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const folder = decodeURIComponent(req.query["folder"] as string) || "";

  mediaService
    .getMedia(folder)
    .then((media) => res.status(200).json(media))
    .catch((e) => {
      logger.error(e);
      res.status(500).json({});
    });
});

app.get("/api/youtube/search", (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const q = decodeURIComponent(req.query["q"] as string) || "";

  youtubeService
    .search(q)
    .then((data) => res.status(200).json(data))
    .catch((e) => {
      logger.error(e);
      res.status(500).json({});
    });
});

app.get("/api/youtube/play", (req, res) => {
  logger.debug(chalk.cyan(`GET ${req.url}`));
  const id: string = req.query["id"] as string;

  if (!id) {
    logger.error("Missing youtube ID");
    res.status(404);
  } else {
    appManager
      .onYoutubeCommand({ action: "play", data: id })
      .then(() => res.status(200).json())
      .catch((e) => {
        logger.error(e);
        res.status(500).json({});
      });
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
