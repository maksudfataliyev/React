import { authHttp, authHttpTyped } from "./httpClient";
import axios from 'axios';
import type { LoginRequest, LoginResponse } from "@/features/auth/DTOs/auth.interfaces";
import { tokenStorage } from "@/shared/tokenStorage";
import { ApiResponse, TypedResult } from "@/shared/types";

/** Login using untyped axios */
export async function login(payload: LoginRequest): Promise<any> {
  const  {data}  = await authHttp.post<any>("/Login", payload);
  console.log("Login response:", data.response);
  if (isBannedError(data)) {
    console.log("Banned error detected in login response:", data);
  }

  if (data?.data && data?.data.refreshToken) {
    tokenStorage.set({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
  }
  return data;
}

export function isBannedError(resp: any) {
  return resp.isSuccess === false && /banned/i.test(resp.message || '');
}

export async function loginTyped(
  payload: LoginRequest
): Promise<TypedResult<LoginResponse>> {
  const result = await authHttpTyped.post<LoginResponse>("/Login", payload);

  if (result.isSuccess && result.data?.accessToken && result.data?.refreshToken) {
    tokenStorage.set({ accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
  }

  return result;
}

/** Logout locally */
export function logout() {
  tokenStorage.clear();
  try { window.location.href = '/auth'; } catch {}
}

/** Manually refresh tokens when a 401 error is detected */
export async function manualRefreshToken(refreshToken: string): Promise<TypedResult<LoginResponse>> {
  const oldAccessToken = tokenStorage.get();
  try {
    // Use plain axios to avoid triggering authHttp interceptors that may cause recursion
    const base = (authHttp as any)?.defaults?.baseURL ?? '';
    const url = `${base}/RefreshToken`;
    const resp = await axios.post<LoginResponse>(url, { refreshToken, oldAccessToken });
    const data = resp?.data ?? null;
    console.log("manualRefreshToken response:", data);
    if (data?.accessToken && data?.refreshToken) {
      tokenStorage.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return TypedResult.success(data, "Token refreshed successfully");
    }

    // refresh failed: clear local tokens and redirect to auth page
    try { tokenStorage.clear(); } catch {}
    try { window.location.href = '/auth'; } catch {}

    return TypedResult.error("Failed to refresh token", 401);
  } catch (err) {
    console.error('manualRefreshToken error', err);
    try { tokenStorage.clear(); } catch {}
    try { window.location.href = '/auth'; } catch {}
    return TypedResult.error("Failed to refresh token", 401);
  }
}