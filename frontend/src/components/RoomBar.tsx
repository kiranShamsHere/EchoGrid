interface Props {
  room: string;
  username: string;
  isConnected: boolean;
  onlineCount: number;
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

export function RoomBar({ room, username, isConnected, onlineCount }: Props) {
  const avatar = getAvatarColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div style={{
      padding: "14px 16px 12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      borderBottom: "0.5px solid var(--color-border-tertiary)",
      background: "var(--color-background-primary)",
      flexShrink: 0,
    }}>
      {/* Avatar */}
      <div style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: avatar.bg,
        color: avatar.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: 500,
        flexShrink: 0,
      }}>
        {initials}
      </div>

      {/* Room info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          textTransform: "capitalize",
        }}>
          {room}
        </div>
        <div style={{
          fontSize: "11px",
          color: isConnected ? "#1D9E75" : "var(--color-text-tertiary)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "1px",
        }}>
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isConnected ? "#1D9E75" : "#E24B4A",
            flexShrink: 0,
          }} />
          {isConnected ? `Online · ${onlineCount} members` : "Reconnecting..."}
        </div>
      </div>

      {/* Action icons */}
      <div style={{ display: "flex", gap: "16px", color: "var(--color-text-secondary)" }}>
        <i className="ti ti-phone" style={{ fontSize: "18px", cursor: "pointer" }} aria-hidden="true" />
        <i className="ti ti-video" style={{ fontSize: "18px", cursor: "pointer" }} aria-hidden="true" />
        <i className="ti ti-dots-vertical" style={{ fontSize: "18px", cursor: "pointer" }} aria-hidden="true" />
      </div>
    </div>
  );
}