import express from "express";
import https from "httpolyglot";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import mediasoup from "mediasoup";

const app = express();
const __dirname = path.resolve();

app.use("/sfu", express.static(path.join(__dirname, "/public")));

const options = {
  key: fs.readFileSync("./server/ssl/key.pem", "utf-8"),
  cert: fs.readFileSync("./server/ssl/cert.pem", "utf-8"),
};
const httpsServer = https.createServer(options, app);

app.get("/", (req, res) => {
  res.send("Hello from mediasoup app!");
});

httpsServer.listen(3000, () => {
  console.log("Listening on port: " + 3000);
});

const io = new Server(httpsServer);

const peers = io.of("/mediasoup");

let worker;
let router;

const createWorker = async () => {
  worker = await mediasoup.createWorker();
  console.log(`worker pid ${worker.pid}`);

  worker.on("died", (error) => {
    console.log("mediasoup worker has died.");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  return worker;
};

worker = createWorker();
const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  },
];

peers.on("connection", async (socket) => {
  socket.emit("connection-success", { socketId: socket.id });

  socket.on("disconnect", () => {
    console.log("User disconnected...");
  });

  router = await worker.createRouter({ mediaCodecs });

  socket.on("getRtpCapabilites", async (callback) => {
    const rtpCapabilities = await router.rtpCapabilities;
    console.log("rtp capabilites from backend ", rtpCapabilities);

    callback({ rtpCapabilities });
  });
});
