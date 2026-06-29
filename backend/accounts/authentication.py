from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTCookieAuthentication(JWTAuthentication):
    """
    Authenticate from the httpOnly access-token cookie instead of the
    Authorization header, so the JWT is never exposed to JavaScript.

    Falls back to the standard Authorization header (handy for Swagger / tooling).
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if not raw_token:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
