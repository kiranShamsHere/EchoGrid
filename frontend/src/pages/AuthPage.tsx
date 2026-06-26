import { useState } from "react";
import { signup, login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

interface Props {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: Props) {
  const { saveAuth } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = mode === "signup"
        ? await signup(username, email, password)
        : await login(email, password);

      saveAuth(
        { username: res.username, email: res.email },
        res.access_token
      );
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-background-tertiary)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

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
        .auth-input:focus {
          border-color: #8B5CF6 !important;
        }
        .tab-btn {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
      `}</style>

      <div className="echo-card" style={{
        background: "var(--color-background-primary)",
        borderRadius: "20px",
        padding: "36px",
        width: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
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
            {mode === "login" ? "Welcome back." : "Create your account."}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex",
          gap: "6px",
          background: "var(--color-background-secondary)",
          padding: "4px",
          borderRadius: "10px",
        }}>
          <button
            className="tab-btn"
            onClick={() => { setMode("login"); setError(""); }}
            style={{
              background: mode === "login"
                ? "var(--color-background-primary)"
                : "transparent",
              color: mode === "login"
                ? "var(--color-text-primary)"
                : "var(--color-text-tertiary)",
              boxShadow: mode === "login"
                ? "0 1px 4px rgba(0,0,0,0.08)"
                : "none",
            }}
          >
            Log in
          </button>
          <button
            className="tab-btn"
            onClick={() => { setMode("signup"); setError(""); }}
            style={{
              background: mode === "signup"
                ? "var(--color-background-primary)"
                : "transparent",
              color: mode === "signup"
                ? "var(--color-text-primary)"
                : "var(--color-text-tertiary)",
              boxShadow: mode === "signup"
                ? "0 1px 4px rgba(0,0,0,0.08)"
                : "none",
            }}
          >
            Sign up
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Username — signup only */}
          {mode === "signup" && (
            <div>
              <label style={labelStyle}>Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. kiran"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontSize: "13px",
            color: "#EF4444",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            padding: "10px 14px",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "13px",
            borderRadius: "99px",
            border: "none",
            background: loading
              ? "var(--color-background-secondary)"
              : "linear-gradient(135deg, #8B5CF6, #EC4899)",
            color: loading ? "var(--color-text-tertiary)" : "#ffffff",
            fontSize: "14px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>

      </div>
    </div>
  );
}