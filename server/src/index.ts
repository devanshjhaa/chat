/// <reference types="node" />
import { WebSocketServer, WebSocket, RawData } from "ws";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;

interface User {
  socket: WebSocket;
  room: string;
  name: string;
}

let allSockets: User[] = [];

const wss = new WebSocketServer({ port: Number(PORT) });

wss.on("connection", (socket: WebSocket) => {
  console.log("Client connected");

  socket.on("message", (data: RawData) => {
    try {
      const parsed = JSON.parse(data.toString());

      // Handle join
      if (parsed.type === "join") {
        const { roomId, name } = parsed.payload;
        allSockets.push({ socket, room: roomId, name });
        console.log(`User ${name} joined room ${roomId}`);
      }

      // Handle chat
      if (parsed.type === "chat") {
        const sender = allSockets.find((u) => u.socket === socket);
        if (!sender) return;

        const messageText = parsed.payload.message;

        const outgoing = JSON.stringify({
          text: messageText,
          name: sender.name,
        });

        // Send to everyone else in the same room
        allSockets
          .filter((u) => u.room === sender.room && u.socket !== socket)
          .forEach((u) => u.socket.send(outgoing));
      }
    } catch (err) {
      console.error("Invalid message format:", data);
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((u) => u.socket !== socket);
  });

  socket.on("error", (err: Error) => {
    console.error("WebSocket error:", err);
  });
});

console.log(` WebSocket server is running at ws://localhost:${PORT}`);
