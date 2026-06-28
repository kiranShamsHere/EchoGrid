import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { useWebSocket } from "./hooks/useWebSocket";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { RoomBar } from "./components/RoomBar";
import { Sidebar } from "./components/Sidebar";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ChatApp() {
  const { user, logout } = useAuth();
  const [currentRoom, setCurrentRoom] = useState("general");
  const [roomLabel, setRoomLabel] = useState("general");

  const { messages, sendMessage, isConnected, onlineCount } = useWebSocket(
    currentRoom,
    user!.username
  );

  const handleSelectRoom = (room: string, label: string) => {
    setCurrentRoom(room);
    setRoomLabel(label);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "var(--color-background-tertiary)",
    }}>
      {/* Sidebar */}
      <Sidebar
        currentUser={user!.username}
        currentRoom={currentRoom}
        onSelectRoom={handleSelectRoom}
      />

      {/* Chat area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}>
        <RoomBar
          room={roomLabel}
          username={capitalize(user!.username)}
          isConnected={isConnected}
          onlineCount={onlineCount}
          onLogout={logout}
        />
        <MessageList
          messages={messages}
          currentUser={user!.username}
        />
        <ChatInput
          onSend={sendMessage}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  if (!user) return <AuthPage onSuccess={() => {}} />;
  return <ChatApp />;
}