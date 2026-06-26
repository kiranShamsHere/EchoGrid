import { IconMoodSmile, IconPaperclip, IconSend } from "@tabler/icons-react";
import { useState, type KeyboardEvent } from "react";

interface Props {
  onSend: (content: string) => void;
  isConnected: boolean;
}

export function ChatInput({ onSend, isConnected }: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim() === "" || !isConnected) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: "10px 12px",
      borderTop: "0.5px solid var(--color-border-tertiary)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "var(--color-background-primary)",
      flexShrink: 0,
    }}>

      {/* Emoji button */}
      <button
        aria-label="Emoji"
        style={{
          width: "32px", height: "32px",
          borderRadius: "50%", border: "none",
          background: "none", cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        <IconMoodSmile size={20} />
      </button>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isConnected ? "Message..." : "Reconnecting..."}
        disabled={!isConnected}
        style={{
          flex: 1,
          padding: "9px 16px",
          borderRadius: "99px",
          border: "1.5px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          background: "var(--color-background-secondary)",
          color: "var(--color-text-primary)",
          fontSize: "13px",
          outline: "none",
          opacity: isConnected ? 1 : 0.6,
        }}
      />

      {/* Attachment button */}
      <button
        aria-label="Attach file"
        style={{
          width: "32px", height: "32px",
          borderRadius: "50%", border: "none",
          background: "none", cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        <IconPaperclip size={20} />
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!isConnected || value.trim() === ""}
        aria-label="Send message"
        style={{
          width: "36px", height: "36px",
          borderRadius: "50%", border: "none",
          background: isConnected && value.trim() !== ""
            ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
            : "var(--color-background-secondary)",
          cursor: isConnected && value.trim() !== "" ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        <IconSend
          size={17}
          style={{
            color: isConnected && value.trim() !== ""
              ? "#ffffff"
              : "var(--color-text-tertiary)",
          }}
        />
      </button>

    </div>
  );
}