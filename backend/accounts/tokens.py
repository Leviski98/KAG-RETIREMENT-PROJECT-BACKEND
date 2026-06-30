"""
Short-lived "pre-auth" token issued after a valid password login.

It binds the OTP step to a validated credentials check: the OTP-verify endpoint
only accepts a code accompanied by a token carrying `scope == "otp"`. It is NOT an
access token — it cannot authenticate against protected endpoints.
"""
from datetime import timedelta

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import Token


class OTPToken(Token):
    token_type = 'otp'
    lifetime = timedelta(minutes=5)

    @classmethod
    def for_user(cls, user) -> 'OTPToken':
        token = cls()
        token['user_id'] = user.id
        token['scope'] = 'otp'
        return token


def get_user_id_from_otp_token(raw_token: str) -> int:
    """Validate an OTP pre-auth token and return its user id, or raise TokenError."""
    token = OTPToken(raw_token)
    if token.get('scope') != 'otp':
        raise TokenError('Not an OTP token.')
    user_id = token.get('user_id')
    if not user_id:
        raise TokenError('Malformed OTP token.')
    return user_id
