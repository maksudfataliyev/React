export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  data: LoginResponse;
}