import http from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 8080;

interface User {
  socket: WebSocket;
  room: string;
  name: string;
}

let allSockets: User[] = [];

const server = http.createServer((req, res) => {
  // Optional: handle HTTP requests here or just send 404
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket: WebSocket) => {
  console.log("Client connected");

  socket.on("message", (data: RawData) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === "join") {
        const { roomId, name } = parsed.payload;
        allSockets.push({ socket, room: roomId, name });
        console.log(`User ${name} joined room ${roomId}`);
      }

      if (parsed.type === "chat") {
        const sender = allSockets.find((u) => u.socket === socket);
        if (!sender) return;

        const messageText = parsed.payload.message;

        const outgoing = JSON.stringify({
          text: messageText,
          name: sender.name,
        });

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

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
