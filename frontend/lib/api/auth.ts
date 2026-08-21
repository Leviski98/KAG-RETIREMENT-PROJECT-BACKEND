import { apiClient } from '@/lib/api/client';
import type {
  AuthUser,
  LoginResult,
  MessageResult,
  UserRole,
  VerifyEmailResult,
} from '@/types/auth';

export interface SignupInput {
  full_name: string;
  email: string;
  password: string;
}

export interface ApproveUserInput {
  userId: number;
  role: UserRole;
  districtIds?: number[];
}

export const authApi = {
  signup: (data: SignupInput): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/signup', data),

  verifyEmail: (token: string): Promise<VerifyEmailResult> =>
    apiClient.post<VerifyEmailResult>('/auth/verify-email', { token }),

  resendVerificationEmail: (email: string): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/verify-email/resend', { email }),

  requestPasswordReset: (email: string): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/password-reset', { email }),

  confirmPasswordReset: (token: string, password: string): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/password-reset/confirm', { token, password }),

  login: (email: string, password: string): Promise<LoginResult> =>
    apiClient.post<LoginResult>('/auth/login', { email, password }),

  verifyOtp: (otpToken: string, code: string): Promise<AuthUser> =>
    apiClient.post<AuthUser>('/auth/otp/verify', { otp_token: otpToken, code }),

  resendOtp: (otpToken: string): Promise<MessageResult> =>
    apiClient.post<MessageResult>('/auth/otp/resend', { otp_token: otpToken }),

  me: (): Promise<AuthUser> => apiClient.get<AuthUser>('/auth/me'),

  logout: (): Promise<MessageResult> => apiClient.post<MessageResult>('/auth/logout'),

  pendingUsers: (): Promise<AuthUser[]> => apiClient.get<AuthUser[]>('/auth/users/pending'),

  activeUsers: (): Promise<AuthUser[]> => apiClient.get<AuthUser[]>('/auth/users/active'),

  approveUser: ({ userId, role, districtIds }: ApproveUserInput): Promise<AuthUser> =>
    apiClient.post<AuthUser>(`/auth/users/${userId}/approve`, {
      role,
      district_ids: districtIds ?? [],
    }),

  rejectUser: (userId: number): Promise<void> =>
    apiClient.post<void>(`/auth/users/${userId}/reject`),
};
