import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { useWebSocket } from "./hooks/useWebSocket";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { RoomBar } from "./components/RoomBar";

const DEFAULT_ROOM = "general";

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function ChatApp() {
  const { user, logout } = useAuth();
  const { messages, sendMessage, isConnected, onlineCount } = useWebSocket(
    DEFAULT_ROOM,
    user!.username
  );

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
  );
}

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage onSuccess={() => {}} />;
  }

  return <ChatApp />;
}