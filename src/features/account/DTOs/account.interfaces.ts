export interface RegisterRequest {
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    street: string;
    addressDetails: string;
    city: string;
    zipCode: string;
}

export interface RegisterResponse {
    isSuccess: boolean;
    message?: string;
    error?: string;
    statusCode?: number;
    data?: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ChangePasswordRequest {
    userId: string;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
