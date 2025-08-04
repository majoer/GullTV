import express from "express";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { MediaService } from "./service/media-service";
import { ViewProgressService } from "./service/view-progress-service";
import { VlcService } from "./service/vlc-service";

const port = 3000;
const wsPort = 3001;
const app = express();
const wss = new WebSocketServer({ port: wsPort });
const viewProgressService = ViewProgressService();
const vlcSevice = VlcService(wss, viewProgressService);
const mediaService = MediaService(viewProgressService);

wss.on("connection", (socket: WebSocket) => {
  console.log("Websocket connected");

  socket.on("close", () => {
    console.log("Websocket disconnected");
  });
});

app.get("/api/vlc/{*vlcPath}", async (req, res) => {
  console.log(`IN GET ${req.url}`);

  const command = `${req.url.replace("/api/vlc/", "")}`;
  const result = await vlcSevice.runVlcCommand(command);

  res.status(result.status).json(result.data);
});

app.get("/api/media", async (req, res) => {
  console.log(`IN GET ${req.url}`);
  const folder: string = (req.query["folder"] as string) || "";

  const media = await mediaService.getMedia(folder);
  res.status(200).json(media);
});

app.get("/api/view-progress", async (req, res) => {
  console.log(`IN GET ${req.url}`);

  const progress = await viewProgressService.getProgress();
  res.status(200).json(progress);
});

app.use(express.static("dist/client"));
app.get("{*all}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Express started on ${port}`);
  }
});
