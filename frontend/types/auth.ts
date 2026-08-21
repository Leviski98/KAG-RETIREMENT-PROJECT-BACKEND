export type UserRole = "admin" | "archbishop" | "bishop" | "";

export interface AuthUserDistrict {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  email_verified: boolean;
  is_active: boolean;
  date_joined: string;
  role: UserRole;
  role_display: string;
  districts: AuthUserDistrict[];
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
