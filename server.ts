import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity; adjust as needed
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join-room", (data) => {
    socket.join(data.roomName);
    socket.data.username = data.username;
    socket.data.roomName = data.roomName;

    socket.to(data.roomName).emit("user-joined", {
      username: "System",
      message: `${data.username} joined the room`,
    });
  });

  socket.on("send-message", (msg) => {
    socket.to(msg.roomName).emit("received-message", {
      username: msg.username,
      message: msg.message,
    });
  });

  socket.on("disconnect", () => {
    const username = socket.data.username;
    const roomName = socket.data.roomName;
    if (username && roomName) {
      socket.to(roomName).emit("user-left", {
        username: "System",
        message: `${username} left the room`,
      });
    }
    console.log("user disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Socket.IO server!");
});

 
httpServer.listen(PORT, () => {
  console.log(`Server listening on ${HOST}`);
});