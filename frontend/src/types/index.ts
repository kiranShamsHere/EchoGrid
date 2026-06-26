export interface User {
  username: string;
  email: string;
}

export interface Room {
  name: string;
  count: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
  email: string;
}