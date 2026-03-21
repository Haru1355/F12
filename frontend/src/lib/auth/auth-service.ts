export interface User {
  id: string;
  name: string;
  email: string;
  role: "psychologist" | "admin";
}

interface AuthResponse {
  user: User;
  token: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function login(email: string, password: string, role: string): Promise<AuthResponse> {
  await delay(500);
  if (!email || !password) {
    throw new Error("Заполните все поля");
  }
  return {
    user: {
      id: "1",
      name: email.split("@")[0],
      email,
      role: role as "psychologist" | "admin",
    },
    token: "mock-jwt-token",
  };
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string
): Promise<AuthResponse> {
  await delay(500);
  if (!name || !email || !password) {
    throw new Error("Заполните все поля");
  }
  return {
    user: {
      id: Date.now().toString(),
      name,
      email,
      role: role as "psychologist" | "admin",
    },
    token: "mock-jwt-token",
  };
}
