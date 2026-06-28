import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { IconUsers, IconMessage, IconHash } from "@tabler/icons-react";

interface Conversation {
  room_id: string;
  other_user: string;
  last_message: string;
  last_time: string;
}

interface Props {
  currentUser: string;
  currentRoom: string;
  onSelectRoom: (room: string, label: string) => void;
}

function getAvatarColor(name: string): { bg: string; color: string } {
  const colors = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#E1F5EE", color: "#0F6E56" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#FAECE7", color: "#993C1D" },
    { bg: "#E6F1FB", color: "#0C447C" },
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

export function Sidebar({ currentUser, currentRoom, onSelectRoom }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tab, setTab] = useState<"chats" | "users">("chats");

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for online users
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [onlineRes, convoRes] = await Promise.all([
        api.get("/users/online"),
        api.get(`/users/conversations/${currentUser}`),
      ]);
      setOnlineUsers(onlineRes.data.users.filter((u: string) => u !== currentUser));
      setConversations(convoRes.data);
    } catch (e) {
      console.error("Failed to fetch sidebar data", e);
    }
  };

  const startDM = (otherUser: string) => {
    // Always sort usernames so room ID is consistent
    const roomId = [currentUser, otherUser].sort().join("_");
    onSelectRoom(roomId, otherUser);
  };

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: "7px",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    background: active ? "var(--color-background-primary)" : "transparent",
    color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    transition: "all 0.15s",
  });

  return (
    <div style={{
      width: "260px",
      flexShrink: 0,
      background: "var(--color-background-primary)",
      borderRight: "0.5px solid var(--color-border-tertiary)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>

      {/* Header */}
      <div style={{
        padding: "16px 14px 12px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}>
        <div style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          marginBottom: "12px",
        }}>
          Echo<span style={{ color: "#8B5CF6" }}>Grid</span>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex",
          gap: "4px",
          background: "var(--color-background-secondary)",
          padding: "3px",
          borderRadius: "10px",
        }}>
          <button style={tabStyle(tab === "chats")} onClick={() => setTab("chats")}>
            Chats
          </button>
          <button style={tabStyle(tab === "users")} onClick={() => setTab("users")}>
            People
          </button>
        </div>
      </div>

      {/* General room */}
      <div
        onClick={() => onSelectRoom("general", "general")}
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          background: currentRoom === "general"
            ? "var(--color-background-secondary)"
            : "transparent",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <div style={{
          width: "34px", height: "34px",
          borderRadius: "10px",
          background: "#EEEDFE",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconHash size={16} style={{ color: "#3C3489" }} />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
            General
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
            Group chat
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Chats tab — past DM conversations */}
        {tab === "chats" && (
          <div>
            {conversations.length === 0 ? (
              <div style={{
                padding: "24px 14px",
                fontSize: "12px",
                color: "var(--color-text-tertiary)",
                textAlign: "center",
                lineHeight: 1.6,
              }}>
                No DMs yet. Go to People tab to start a conversation.
              </div>
            ) : (
              conversations.map((c) => {
                const av = getAvatarColor(c.other_user);
                const isActive = currentRoom === c.room_id;
                return (
                  <div
                    key={c.room_id}
                    onClick={() => startDM(c.other_user)}
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      background: isActive
                        ? "var(--color-background-secondary)"
                        : "transparent",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <div style={{
                      width: "34px", height: "34px",
                      borderRadius: "50%",
                      background: av.bg, color: av.color,
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px", fontWeight: 500, flexShrink: 0,
                    }}>
                      {c.other_user.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {capitalize(c.other_user)}
                      </div>
                      <div style={{
                        fontSize: "11px",
                        color: "var(--color-text-tertiary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {c.last_message || "No messages yet"}
                      </div>
                    </div>
                    {c.last_time && (
                      <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                        {c.last_time}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* People tab — online users */}
        {tab === "users" && (
          <div>
            <div style={{
              padding: "10px 14px 6px",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--color-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              Online now — {onlineUsers.length}
            </div>
            {onlineUsers.length === 0 ? (
              <div style={{
                padding: "16px 14px",
                fontSize: "12px",
                color: "var(--color-text-tertiary)",
                textAlign: "center",
              }}>
                No one else online right now.
              </div>
            ) : (
              onlineUsers.map((u) => {
                const av = getAvatarColor(u);
                return (
                  <div
                    key={u}
                    onClick={() => startDM(u)}
                    style={{
                      padding: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: "32px", height: "32px",
                        borderRadius: "50%",
                        background: av.bg, color: av.color,
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px", fontWeight: 500,
                      }}>
                        {u.slice(0, 2).toUpperCase()}
                      </div>
                      {/* Online dot */}
                      <div style={{
                        position: "absolute",
                        bottom: 0, right: 0,
                        width: "8px", height: "8px",
                        borderRadius: "50%",
                        background: "#22C55E",
                        border: "1.5px solid var(--color-background-primary)",
                      }} />
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>
                      {capitalize(u)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Current user at bottom */}
      <div style={{
        padding: "12px 14px",
        borderTop: "0.5px solid var(--color-border-tertiary)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "50%",
          background: getAvatarColor(currentUser).bg,
          color: getAvatarColor(currentUser).color,
          display: "flex", alignItems: "center",
          justifyContent: "center",
          fontSize: "11px", fontWeight: 500,
        }}>
          {currentUser.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-primary)" }}>
            {capitalize(currentUser)}
          </div>
          <div style={{ fontSize: "11px", color: "#22C55E" }}>Online</div>
        </div>
      </div>
    </div>
  );
}