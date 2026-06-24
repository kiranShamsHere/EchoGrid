import { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { RoomBar } from "./components/RoomBar";

const DEFAULT_ROOM = "general";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [inputName, setInputName] = useState("");

  const { messages, sendMessage, isConnected, onlineCount } = useWebSocket(
    DEFAULT_ROOM,
    username
  );

  const handleJoin = () => {
    if (inputName.trim() === "") return;
    setUsername(inputName.trim());
    setJoined(true);
  };

  // Join screen
  if (!joined) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background-tertiary)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {/* ✅ Animated border keyframes injected here */}
        <style>{`
          @keyframes borderLoop {
            0%   { border-color: #8B5CF6; }
            25%  { border-color: #EC4899; }
            50%  { border-color: #3B82F6; }
            75%  { border-color: #10B981; }
            100% { border-color: #8B5CF6; }
          }
          .echo-card {
            animation: borderLoop 3s linear infinite;
            border: 2px solid #8B5CF6;
          }
        `}</style>

        {/* ✅ className added, border removed from inline styles */}
        <div className="echo-card" style={{
          background: "var(--color-background-primary)",
          borderRadius: "20px",
          padding: "40px",
          width: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}>
          {/* Logo */}
          <div>
            <h1 style={{
              fontSize: "26px",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "-0.5px",
            }}>
              Echo<span style={{ color: "#8B5CF6" }}>Grid</span>
            </h1>
            <p style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              margin: "6px 0 0",
            }}>
              Real-time messaging. No friction.
            </p>
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Choose a username"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoin();
            }}
            style={{
              padding: "12px 16px",
              borderRadius: "99px",
              border: "1.5px solid #e2e8f0",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />

          {/* Join button */}
          <button
            onClick={handleJoin}
            style={{
              padding: "12px",
              borderRadius: "99px",
              border: "none",
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Join EchoGrid
          </button>

          <p style={{
            fontSize: "12px",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            margin: 0,
          }}>
            You'll join the #{DEFAULT_ROOM} room
          </p>
        </div>
      </div>
    );
  }

  // Main chat
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--color-background-tertiary)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <RoomBar
        room={DEFAULT_ROOM}
        username={capitalize(username)}
        isConnected={isConnected}
        onlineCount={onlineCount}
      />
      <MessageList
        messages={messages}
        currentUser={username}
      />
      <ChatInput
        onSend={sendMessage}
        isConnected={isConnected}
      />
    </div>
  );
}