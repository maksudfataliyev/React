import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginRequest } from "@/features/auth/DTOs/auth.interfaces";
import { decodeUserFromToken } from "@/shared/utils/decodeToken";

export interface AuthUser {
  userId: string;
  name: string;
  surname: string;
  email: string;
  is_email_verified: boolean;
  phone_number?: string;
  profile_image?: string;
  client_profile_id?: string;

}

import {
  loginTyped,
  logout as logoutApi,
} from "@/features/auth/services/auth.service";
import { tokenStorage } from "@/shared/tokenStorage";

export type LoginResult =
  | { success: true }
  | { success: false, error?: string };

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (payload: LoginRequest) => Promise<LoginResult>;
  logout: () => Promise<void> | void;
  setUser: (u: AuthUser | null) => void;
}


export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const checkTokensAndSetUser = () => {
    const accessToken = tokenStorage.get();
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      tokenStorage.clear();
      setUser(null);
      return;
    }

    const decoded = decodeUserFromToken(accessToken);
    if (decoded) {
      // Map decoded token to AuthUser, providing defaults for missing fields
      const mappedUser: AuthUser = {
        userId: decoded.userId,
        name: decoded.name ?? "",
        surname: decoded.surname ?? "",
        email: decoded.email ?? "",
        is_email_verified: decoded.is_email_verified ?? false,
        profile_image: decoded.profile_image ?? "",
        client_profile_id: decoded.client_profile_id ?? "",
        phone_number: decoded.phone_number ?? "",
      };
      setUser(mappedUser);
    }
  };

  useEffect(() => {
    // Run on mount
    checkTokensAndSetUser();

    // Listen for token changes from tokenStorage
    const handler = () => checkTokensAndSetUser();
    try {
      window.addEventListener('auth:tokensChanged', handler);
    } catch {
      /* ignore SSR */
    }

    return () => {
      try {
        window.removeEventListener('auth:tokensChanged', handler);
      } catch {
        /* ignore SSR */
      }
    };
  }, []);

  const login = useCallback(
    async (payload: LoginRequest): Promise<LoginResult> => {
      setLoading(true);
      try {
        const result = await loginTyped(payload);

        if (result.isSuccess && result.data) {
          tokenStorage.set(result.data);
          const decoded = decodeUserFromToken(result.data.accessToken);
          if (decoded) {
            const mappedUser: AuthUser = {
              userId: decoded.userId,
              name: decoded.name ?? "",
              surname: decoded.surname ?? "",
              email: decoded.email ?? "",
              profile_image: decoded.profile_image ?? "",
              phone_number: decoded.phone_number ?? "",
              is_email_verified: decoded.is_email_verified ?? false,
              client_profile_id: decoded.client_profile_id ?? "",
            };
            setUser(mappedUser);
          }
          return { success: true };
        } else {
          return { success: false, error: result.message };
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Authentication error";
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await Promise.resolve(logoutApi());
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,

      login,
      logout,
      setUser,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
