import axios from "axios";
import express from "express";
import { MediaService } from "./service/media-service";

const port = 3000;
const vlcTarget = "http://localhost:8080";
const app = express();
const mediaService = MediaService();

app.get("/api/vlc/{*vlcPath}", async (req, res) => {
  console.log(`IN GET ${req.url}`);
  const url = `${vlcTarget}/${req.url.replace("/api/vlc/", "")}`;

  console.log(`OUT GET ${url}`);
  const vlcRes = await axios.get(url, {
    insecureHTTPParser: true,
    auth: {
      username: "",
      password: "mats",
    },
  });

  res.status(vlcRes.status).json(vlcRes.data);
});

app.get("/api/media", async (req, res) => {
  console.log(`IN GET ${req.url}`);
  const folder: string = (req.query["folder"] as string) || "";
  
  const media = await mediaService.getMedia(folder);
  res.status(200).json(media);
});

app.use(express.static("dist/client"));

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Express started on ${port}`);
  }
});
