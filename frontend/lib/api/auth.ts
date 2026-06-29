import { apiClient } from '@/lib/api/client';
import type {
  AuthUser,
  LoginResult,
  MessageResult,
  VerifyEmailResult,
} from '@/types/auth';

export interface SignupInput {
  full_name: string;
  email: string;
  password: string;
}

export const authApi = {
  signup: (data: SignupInput): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/signup', data),

  verifyEmail: (token: string): Promise<VerifyEmailResult> =>
    apiClient.post<VerifyEmailResult>('/auth/verify-email', { token }),

  login: (email: string, password: string): Promise<LoginResult> =>
    apiClient.post<LoginResult>('/auth/login', { email, password }),

  verifyOtp: (otpToken: string, code: string): Promise<AuthUser> =>
    apiClient.post<AuthUser>('/auth/otp/verify', { otp_token: otpToken, code }),

  resendOtp: (otpToken: string): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/otp/resend', { otp_token: otpToken }),

  me: (): Promise<AuthUser> => apiClient.get<AuthUser>('/auth/me'),

  logout: (): Promise<MessageResult> => apiClient.post<MessageResult>('/auth/logout'),

  pendingUsers: (): Promise<AuthUser[]> => apiClient.get<AuthUser[]>('/auth/users/pending'),

  approveUser: (userId: number): Promise<AuthUser> =>
    apiClient.post<AuthUser>(`/auth/users/${userId}/approve`),
};
