const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Connected to Redis');

  // Listen for notifications from other services (e.g., Django)
  const externalSubClient = pubClient.duplicate();
  externalSubClient.connect().then(() => {
    externalSubClient.subscribe('notifications', (message) => {
      console.log('External notification received:', message);
      try {
        const data = JSON.parse(message);
        io.emit('receive_message', data);
      } catch (e) {
        io.emit('receive_message', { message: message });
      }
    });
  });
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    // data: { room, message, sender }
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});
