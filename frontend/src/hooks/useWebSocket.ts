import { api } from "../api/auth";
import { useEffect, useRef, useState, useCallback } from "react";

export interface EchoMessage {
  type: "chat" | "system" | "error" | "room_info";
  content: string;
  sender: string;
  room: string;
  timestamp: string;
  count?: number;
}

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

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track current room in a ref so onclose handler always sees latest value
  const roomRef = useRef(room);
  const shouldReconnect = useRef(true);

  const connect = useCallback((targetRoom: string) => {
    // ✅ Force close any existing socket before opening new one
    if (socketRef.current) {
      shouldReconnect.current = false;
      socketRef.current.close();
      socketRef.current = null;
    }

    // Cancel any pending reconnect timer
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    shouldReconnect.current = true;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/${targetRoom}/${username}`
    );

  ws.onopen = async () => {
  setIsConnected(true);
  setOnlineCount(0); // Will be updated by room_info message immediately

  if (reconnectTimer.current) {
    clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;
  }

  try {
    const res = await api.get(`/messages/${targetRoom}`);
    setMessages(res.data);
  } catch (e) {
    console.error("Failed to load history", e);
  }
  };

  ws.onmessage = (event) => {
  const message: EchoMessage = JSON.parse(event.data);

  // ✅ Handle room count updates — never render these as messages
  if (message.type === "room_info") {
    if (message.count !== undefined) {
      setOnlineCount(message.count);
    }
    return;
  }

  // ✅ Handle system messages — filter own join/leave
  if (message.type === "system") {
    const lower = message.content.toLowerCase();
    const isAboutMe = lower.includes(username.toLowerCase());
    const isJoinLeave = lower.includes("joined") || lower.includes("left");

    // Skip join/leave messages about yourself entirely
    if (isAboutMe && isJoinLeave) return;

    setMessages((prev) => [...prev, message]);
    return;
  }

  // ✅ Regular chat message
  setMessages((prev) => [...prev, message]);
};

    ws.onclose = () => {
      setIsConnected(false);

      // ✅ Only auto-reconnect if we didn't intentionally close
      if (shouldReconnect.current) {
        reconnectTimer.current = setTimeout(() => {
          connect(roomRef.current);
        }, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    socketRef.current = ws;
  }, [username]);

  useEffect(() => {
    // ✅ When room changes — clear messages and reconnect to new room
    roomRef.current = room;
    setMessages([]);
    setOnlineCount(0);
    connect(room);

    return () => {
      // ✅ On cleanup — close socket without triggering reconnect
      shouldReconnect.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [room, connect]);

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