import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("yunity_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("yunity_users") || "[]");
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("yunity_user", JSON.stringify(userData));
    return { success: true };
  };

  const register = (name: string, email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("yunity_users") || "[]");
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }
    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      joinedDate: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem("yunity_users", JSON.stringify(users));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem("yunity_user", JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("yunity_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
