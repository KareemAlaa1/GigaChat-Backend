const User = require('../models/user_model');
const Media = require('../models/media_model');
const Message = require('../models/message_model');

const {io} = require('../app_server');

const sockets = {}

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    
    const token = socket.handshake.headers.token;
    console.log("Token:", token);
  
  
    if(token !== "malek")
    {
      socket.disconnect();
      return;
    }
    socket.on("connect_config", (data) => {
      sockets[data.id] = socket.id;
    });
  
    socket.on("send_message", (data) => {
      // socket.broadcast.emit("receive_message", data);
      socket.broadcast.to(sockets[data.targetID]).emit("receive_message", data);
      console.log(data);
    });
  
    socket.on("disconnect", () => {
      console.log("user disconnected: ", socket.id);
    });
  });
  