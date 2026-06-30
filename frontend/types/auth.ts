export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  email_verified: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface LoginResult {
  detail: string;
  otp_token: string;
}

export interface VerifyEmailResult {
  detail: string;
  awaiting_approval: boolean;
}

export interface MessageResult {
  detail: string;
}
