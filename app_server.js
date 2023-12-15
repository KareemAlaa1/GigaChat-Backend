// Run the socket server: node index.js
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const messageController = require('./controllers/message_controller');

app.use(cors());
app.use(express.json());

const { Server } = require("socket.io");



const server = http.createServer(app);

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

io.on("connection", async (socket) => {
  console.log(`User Connected: ${socket.id}`);

  const token = socket.handshake.headers.token;

  const handelAuth = await messageController.handleSocketAuth(socket, token);
  console.log(handelAuth);
  if (!handelAuth) return;

  socket.on("send_message", async(message) => {
    console.log(message);
    await messageController.sendMessage(socket, message.reciever_ID, message.data);
  });

  socket.on("disconnect", () => {
    messageController.userDisconnected(socket.id);
    console.log("user disconnected: ", socket.id);
  });
});

server.listen(3002, () => {
  console.log("SERVER IS RUNNING");
});

module.exports = app;