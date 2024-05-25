const io = require("socket.io-client");
const btnLocalVideo = document.getElementById("btnLocalVideo");
const localVideo = document.getElementById("localVideo");

const socket = io("/mediasoup");

socket.on("connection-success", ({ socketId }) => {
  console.log(socketId);
});

let params = {};

const streamSuccess = (stream) => {
  localVideo.srcObject = stream;

  const track = stream.getVideoTracks()[0];

  params = {
    track,
    ...params,
  };
};

const streamError = (e) => {
  console.log(e);
};

btnLocalVideo.addEventListener("click", (e) => {
  const constrains = {
    audio: false,
    video: {
      width: {
        min: 640,
        max: 1920,
      },
      height: {
        min: 400,
        max: 1080,
      },
    },
  };

  navigator.mediaDevices
    .getUserMedia(constrains)
    .then(streamSuccess)
    .catch(streamError);
});
