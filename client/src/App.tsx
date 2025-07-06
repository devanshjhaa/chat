import { useEffect, useRef, useState } from "react";

interface Message {
  text: string;
  name: string;
  fromMe: boolean;
}

const App = () => {
  const [messageText, setMessageText] = useState("");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Extract WebSocket connection setup into a function for reuse
  const connectWebSocket = () => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(" WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { name, roomId },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, { ...data, fromMe: false }]);
    };

    ws.onerror = (err) => {
      console.error(" WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  };

  useEffect(() => {
    if (!joined) return;

    connectWebSocket();

    // Reconnect WebSocket when tab becomes visible if closed
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          console.log("Reconnecting WebSocket after coming back to foreground...");
          connectWebSocket();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      wsRef.current?.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [joined, name, roomId]);

  const handleSend = () => {
    const text = messageText.trim();
    if (!text || !wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: { message: text },
      })
    );

    setMessages((prev) => [...prev, { text, name, fromMe: true }]);
    setMessageText("");
  };

  //  Join Form Screen
  if (!joined) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <input
          placeholder="Your Name"
          className="p-3 rounded w-64 bg-white text-black border border-gray-300 focus:ring-2 focus:ring-purple-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Room ID"
          className="p-3 rounded w-64 bg-white text-black border border-gray-300 focus:ring-2 focus:ring-purple-500"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
          onClick={() => {
            if (name.trim() && roomId.trim()) {
              setJoined(true);
            }
          }}
        >
          Join Chat
        </button>
      </div>
    );
  }

  //  Chat UI
  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`${
                message.fromMe
                  ? "bg-purple-600 text-white"
                  : "bg-white text-black"
              } rounded-lg px-4 py-2 max-w-[75%] break-words`}
            >
              {!message.fromMe && <strong>{message.name}: </strong>}
              {message.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="w-full bg-white flex border-t border-gray-300 p-2">
        <input
          className="flex-1 p-3 rounded-l-md border border-gray-300 outline-none text-black"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-5 rounded-r-md hover:bg-purple-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
