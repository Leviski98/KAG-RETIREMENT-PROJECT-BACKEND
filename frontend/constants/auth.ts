/**
 * sessionStorage key holding the short-lived OTP pre-auth token + email between
 * the login step and the OTP step. Cleared once the OTP is verified.
 */
export const OTP_SESSION_KEY = "kag.otp_session";

/** Name of the httpOnly access-token cookie set by the backend (see SIMPLE_JWT). */
export const ACCESS_COOKIE_NAME = "kag_access";
