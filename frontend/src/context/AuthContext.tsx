import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  saveAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("echogrid_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("echogrid_token")
  );

  const saveAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("echogrid_user", JSON.stringify(user));
    localStorage.setItem("echogrid_token", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("echogrid_user");
    localStorage.removeItem("echogrid_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}