import { api } from "../api/auth";
import { useEffect, useRef, useState, useCallback } from "react";

// The shape of every message coming from EchoGrid backend
export interface EchoMessage {
  type: "chat" | "system" | "error";
  content: string;
  sender: string;
  room: string;
  timestamp: string;
}

// What the hook returns to any component that uses it
interface UseWebSocketReturn {
  messages: EchoMessage[];
  sendMessage: (content: string) => void;
  isConnected: boolean;
  onlineCount: number;
}

export function useWebSocket(
  room: string,
  username: string
): UseWebSocketReturn {
  const [messages, setMessages] = useState<EchoMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  // useRef so the socket instance persists across re-renders
  // without triggering re-renders itself
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Don't open a second connection if one already exists
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/${room}/${username}`
    );

    ws.onopen = async () => {
      setIsConnected(true);

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }

      // Load message history
      try {
        const res = await api.get(`/messages/${room}`);
        setMessages(res.data);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };

    ws.onmessage = (event) => {
      const message: EchoMessage = JSON.parse(event.data);

      setMessages((prev) => [...prev, message]);

      // Count online users by tracking system messages
      if (message.type === "system") {
        if (message.content.includes("joined")) {
          setOnlineCount((prev) => prev + 1);
        } else if (message.content.includes("left")) {
          setOnlineCount((prev) => Math.max(0, prev - 1));
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);

      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      // onclose fires after onerror automatically
      // so reconnect logic is handled there
      ws.close();
    };

    socketRef.current = ws;
  }, [room, username]);

  useEffect(() => {
    connect();

    // Cleanup on unmount — close socket, cancel any pending reconnect
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (
      socketRef.current?.readyState === WebSocket.OPEN &&
      content.trim() !== ""
    ) {
      socketRef.current.send(JSON.stringify({ content }));
    }
  }, []);

  return { messages, sendMessage, isConnected, onlineCount };
}