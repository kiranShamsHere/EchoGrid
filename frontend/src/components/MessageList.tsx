import { useEffect, useRef } from "react";
import type { EchoMessage } from "../hooks/useWebSocket";

interface Props {
  messages: EchoMessage[];
  currentUser: string;
}

function getAvatarColor(name: string): { bg: string; color: string } {
  const colors = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#E1F5EE", color: "#0F6E56" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#FAECE7", color: "#993C1D" },
    { bg: "#E6F1FB", color: "#0C447C" },
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function MessageList({ messages, currentUser }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      padding: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      background: "var(--color-background-tertiary)",
    }}>
      {messages.map((msg, index) => {
        const isOwn = msg.sender === currentUser;
        const isSystem = msg.type === "system";
        const avatar = getAvatarColor(msg.sender);
        const initials = msg.sender.slice(0, 2).toUpperCase();

        // System message — date divider style
        if (isSystem) {
          return (
            <div key={index} style={{
              textAlign: "center",
              alignSelf: "center",
              fontSize: "11px",
              color: "var(--color-text-tertiary)",
              padding: "3px 12px",
              background: "var(--color-background-secondary)",
              borderRadius: "99px",
              margin: "4px 0",
            }}>
              {capitalize(msg.content)}
            </div>
          );
        }

        return (
          <div key={index} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isOwn ? "flex-end" : "flex-start",
            gap: "2px",
          }}>
            {/* Sender name — only for others */}
            {!isOwn && (
              <span style={{
                fontSize: "11px",
                fontWeight: 500,
                color: avatar.color,
                paddingLeft: "36px",
                marginBottom: "1px",
              }}>
                {capitalize(msg.sender)}
              </span>
            )}

            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "6px",
              flexDirection: isOwn ? "row-reverse" : "row",
            }}>
              {/* Avatar — only for others */}
              {!isOwn && (
                <div style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: avatar.bg,
                  color: avatar.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 500,
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: "60%",
                overflow: "hidden",
                padding: "8px 12px",
                borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isOwn
                  ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
                  : "var(--color-background-primary)",
                  border: isOwn ? "none" : "1.5px solid var(--color-border-secondary)",
                color: isOwn ? "#ffffff" : "var(--color-text-primary)",
                fontSize: "13px",
                lineHeight: "1.5",
                wordBreak: "break-word",
              }}>
                {capitalize(msg.content)}
              </div>
            </div>

            {/* Timestamp + ticks */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              paddingLeft: isOwn ? 0 : "36px",
              paddingRight: isOwn ? "2px" : 0,
            }}>
              <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>
                {msg.timestamp}
              </span>
              {isOwn && (
                <i className="ti ti-checks"
                  style={{ fontSize: "11px", color: "#8B5CF6" }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}