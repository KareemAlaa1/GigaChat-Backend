// Run the socket server: node index.js
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const { Server } = require("socket.io");



const server = http.createServer(app);

const arr = [];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow any origin
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["token"],
  },
});

const map = {
  0: "id0xyz",
  1: "id1xyz",
  2: "id2xyz",
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  
  const token = socket.handshake.headers.token;
  console.log("Token:", token);


  if(token !== "malek")
  {
    console.log("Token is not valid");
    socket.emit("token_disconnect", "Token is not valid");
    socket.disconnect();
    return;
  }
  socket.on("connect_config", (data) => {
    map[data.id] = socket.id;
  });

  socket.on("send_message", (data) => {
    // socket.broadcast.emit("receive_message", data);
    socket.broadcast.to(map[data.targetID]).emit("receive_message", data);
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });
});

server.listen(3002, () => {
  console.log("SERVER IS RUNNING");
});

module.exports = app;