// Imports
const io = require("socket.io-client");
const mediasoupClient = require("mediasoup-client");

// Button
const btnLocalVideo = document.getElementById("btnLocalVideo");
const localVideo = document.getElementById("localVideo");
const getRtpCapabilitesButton = document.getElementById("getRtpCapabilites");
const createDeviceButton = document.getElementById("createDevice");

// Constants
const socket = io("/mediasoup");

// Variables
let params = {};
let device;
let rtpCapabilities;

socket.on("connection-success", ({ socketId }) => {
  console.log(socketId);
});

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

const getLocalVideo = () => {
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
};

const getRtpCapabilites = () => {
  socket.emit("getRtpCapabilites", (data) => {
    rtpCapabilities = data.rtpCapabilities;
    console.log("Rtp Capabilites from frontend ", rtpCapabilities);
  });
};

const createDevice = async () => {
  try {
    device = new mediasoupClient.Device();

    await device.load({ routerRtpCapabilities: rtpCapabilities });

    console.log("RTP Capabilities ", device.rtpCapabilities);
  } catch (error) {
    console.log(error);
  }
};

// Get Local Video button
btnLocalVideo.addEventListener("click", getLocalVideo);

// Get RtpCapabilities button
getRtpCapabilitesButton.addEventListener("click", getRtpCapabilites);

// Get Device button
createDeviceButton.addEventListener("click", createDevice);
