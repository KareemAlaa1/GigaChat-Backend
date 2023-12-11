const express = require('express');
const app = express();
const http = require('http').Server(app);
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const io = new Server(http, {
  cors: {
    origin: (origin, callback) => {
      // Allow any origin
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization'],
  },
});

module.exports = { app, io };
