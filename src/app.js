import express from "express";
import https from "httpolyglot";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";

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

peers.on("connection", (socket) => {
  console.log(socket.io);
  socket.emit("connection-success", { socketId: socket.id });
});
