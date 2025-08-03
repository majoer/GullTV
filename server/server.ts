import express from "express";
import { MediaService } from "./service/media-service";
import { VlcService } from "./service/vlc-service";

const port = 3000;
const app = express();
const mediaService = MediaService();
const vlcService = VlcService();

app.get("/api/vlc/{*vlcPath}", async (req, res) => {
  console.log(`IN GET ${req.url}`);

  const command = `${req.url.replace("/api/vlc/", "")}`;
  const result = await vlcService.runVlcCommand(command);

  res.status(result.status).json(result.data);
});

app.get("/api/media", async (req, res) => {
  console.log(`IN GET ${req.url}`);
  const folder: string = (req.query["folder"] as string) || "";

  const media = await mediaService.getMedia(folder);
  res.status(200).json(media);
});

app.use('{*all}', express.static("dist/client"));

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Express started on ${port}`);
  }
});
