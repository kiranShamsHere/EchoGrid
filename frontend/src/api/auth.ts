import axios from "axios";
import type { AuthResponse } from "../types";

const BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("echogrid_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export async function signup(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post("/auth/signup", { username, email, password });
  return res.data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}