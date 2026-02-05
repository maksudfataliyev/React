import { authHttp } from "./httpClient";
import type {
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest
} from "@/features/account/DTOs/account.interfaces";
import type { ChangePasswordRequest } from "@/features/account/DTOs/account.interfaces";
import type { ForgotPasswordRequest } from "@/features/account/DTOs/account.interfaces";
import { ApiResponse } from '@/shared/types';

export async function register(payload: RegisterRequest): Promise<{ isSuccess: boolean; message?: string; data?: any; statusCode?: number }> {
  try {
    const response = await authHttp.post<{ isSuccess?: boolean; message?: string; data?: any }>("/Register", payload);
    console.log("Registration response:", response.data);
    return { isSuccess: response.data?.isSuccess ?? true, message: response.data?.message, data: response.data?.data, statusCode: response.status };
  } catch (error) {
    const err: any = error;
    const backendMessage = err?.response?.data?.message || err?.message || "Request failed";
    const status = err?.response?.status || 0;
    const data = err?.response?.data?.data;
    console.log("Registration error response:", err?.response?.data || err?.message);
    return { isSuccess: false, message: backendMessage, data, statusCode: status };
  }
}

export async function SendConfirmEmail(email?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = email ? { email } : {};
    const { data } = await authHttp.post<{ success: boolean; error?: string }>('/SendConfirmationEmail', payload);
    return data;
  } catch (error) {
    return { success: false, error: (error as any)?.response?.data?.message || (error as Error).message };
  }
}

export async function ChangePassword(payload: ChangePasswordRequest): Promise<ApiResponse<any>> {
    const response = await authHttp.post<ApiResponse<any>>("/ChangePassword", payload);
    return response;
}


export async function ForgotPassword(payload: ForgotPasswordRequest): Promise<{ isSuccess: boolean; message?: string; statusCode?: number }> {
    try {
        const response = await authHttp.post<{ isSuccess: boolean; message?: string }>("/ForgotPassword", payload);
        return { isSuccess: response.data?.isSuccess ?? true, message: response.data?.message, statusCode: response.status };
    } catch (error) {
        const err: any = error;
        const backendMessage = err?.response?.data?.message || err?.message || "Request failed";
        const status = err?.response?.status || 0;
        return { isSuccess: false, message: backendMessage, statusCode: status };
    }
}


export async function resetPassword(payload: ResetPasswordRequest): Promise<{ isSuccess: boolean; message?: string; data?: any; statusCode?: number }> {
    try {
        const response = await authHttp.post<{ isSuccess: boolean; message?: string; data?: any }>("/ResetPassword", payload);
        return {
            isSuccess: response.data?.isSuccess ?? true,
            message: response.data?.message,
            data: response.data?.data,
            statusCode: response.status
        };
    } catch (error) {
        const err: any = error;
        const backendMessage = err?.response?.data?.message || err?.message || "Request failed";
        const status = err?.response?.status || 0;
        const data = err?.response?.data?.data;
        return { isSuccess: false, message: backendMessage, data, statusCode: status };
    }
}