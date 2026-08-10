import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import (
    send_approved_email,
    send_otp_email,
    send_password_reset_email,
    send_verification_email,
)
from .models import EmailVerificationToken, OTPCode, PasswordResetToken, UserProfile
from .serializers import (
    LoginSerializer,
    OTPResendSerializer,
    OTPVerifySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ResendVerificationSerializer,
    SignupSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)
from .tokens import OTPToken, get_user_id_from_otp_token

User = get_user_model()


# --- cookie helpers ----------------------------------------------------------

def _cookie_kwargs() -> dict:
    cfg = settings.SIMPLE_JWT
    return {
        'httponly': True,
        'secure': cfg['AUTH_COOKIE_SECURE'],
        'samesite': cfg['AUTH_COOKIE_SAMESITE'],
        'path': cfg['AUTH_COOKIE_PATH'],
    }


def set_jwt_cookies(response, access: str, refresh: str | None = None) -> None:
    cfg = settings.SIMPLE_JWT
    response.set_cookie(
        cfg['AUTH_COOKIE'],
        access,
        max_age=int(cfg['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        **_cookie_kwargs(),
    )
    if refresh is not None:
        response.set_cookie(
            cfg['AUTH_REFRESH_COOKIE'],
            refresh,
            max_age=int(cfg['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            **_cookie_kwargs(),
        )


def clear_jwt_cookies(response) -> None:
    cfg = settings.SIMPLE_JWT
    response.delete_cookie(cfg['AUTH_COOKIE'], path=cfg['AUTH_COOKIE_PATH'])
    response.delete_cookie(cfg['AUTH_REFRESH_COOKIE'], path=cfg['AUTH_COOKIE_PATH'])


def _issue_otp(user) -> None:
    code = f'{secrets.randbelow(1_000_000):06d}'
    OTPCode.issue(user, code)
    send_otp_email(user, code)


def _blacklist_all_refresh_tokens(user) -> None:
    """Blacklist every outstanding refresh token for `user`, revoking all sessions."""
    from rest_framework_simplejwt.token_blacklist.models import (
        BlacklistedToken,
        OutstandingToken,
    )

    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)


# --- account creation & verification -----------------------------------------

class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'signup'

    @extend_schema(
        tags=['Auth'],
        request=SignupSerializer,
        responses={201: OpenApiResponse(description='Account created; verification email sent.')},
    )
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                is_active=False,  # awaiting email verification + admin approval
            )
            full_name = (data.get('full_name') or '').strip()
            if full_name:
                user.first_name = full_name[:150]
                user.save(update_fields=['first_name'])
            UserProfile.objects.create(user=user)
            token = EmailVerificationToken.objects.create(user=user)

        send_verification_email(user, token.token)
        return Response(
            {'detail': 'Account created. Check your email to verify your address.'},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=['Auth'], request=VerifyEmailSerializer)
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = (
            EmailVerificationToken.objects
            .filter(token=serializer.validated_data['token'])
            .select_related('user', 'user__profile')
            .first()
        )
        if token is None or not token.is_valid:
            return Response(
                {'detail': 'This verification link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            profile, _ = UserProfile.objects.get_or_create(user=token.user)
            profile.email_verified = True
            profile.save(update_fields=['email_verified', 'updated_at'])
            token.used = True
            token.save(update_fields=['used'])

        return Response({
            'detail': 'Email verified. An administrator will activate your account shortly.',
            'awaiting_approval': not token.user.is_active,
        })


class ResendVerificationEmailView(APIView):
    """
    Issue a fresh verification link for a signed-up-but-unverified email.

    Signup can't be repeated for an existing email, and the original link
    expires in 24h, so without this a user who loses or outlasts their first
    link had no way back in short of an admin intervening by hand. Always
    returns the same generic response regardless of whether the address is
    registered, already verified, or unknown, so this can't be used to probe
    which emails have accounts.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'verify_resend'

    @extend_schema(
        tags=['Auth'],
        request=ResendVerificationSerializer,
        responses={200: OpenApiResponse(description='Generic acknowledgement.')},
    )
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower().strip()

        user = User.objects.filter(email__iexact=email).select_related('profile').first()
        if user is not None:
            profile = getattr(user, 'profile', None)
            if not (profile and profile.email_verified):
                token = EmailVerificationToken.issue(user)
                send_verification_email(user, token.token)

        return Response({
            'detail': 'If that email needs verifying, a new link is on its way.',
        })


# --- password reset -----------------------------------------------------------

class PasswordResetRequestView(APIView):
    """
    Email a password-reset link for a registered address.

    Always returns the same generic response whether or not the address has an
    account, so it can't be used to enumerate registered emails. A user must
    have a usable password (i.e. not a placeholder / unset one) to receive a
    link.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    @extend_schema(
        tags=['Auth'],
        request=PasswordResetRequestSerializer,
        responses={200: OpenApiResponse(description='Generic acknowledgement.')},
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower().strip()

        user = User.objects.filter(email__iexact=email).first()
        if user is not None and user.has_usable_password():
            token = PasswordResetToken.issue(user)
            send_password_reset_email(user, token.token)

        return Response({
            'detail': 'If an account exists for that email, a reset link is on its way.',
        })


class PasswordResetConfirmView(APIView):
    """
    Set a new password given a valid reset token.

    On success every outstanding refresh token for the user is blacklisted, so
    any session opened with the old password (e.g. by whoever prompted the
    reset) is forced to re-authenticate.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    @extend_schema(
        tags=['Auth'],
        request=PasswordResetConfirmSerializer,
        responses={200: OpenApiResponse(description='Password updated.')},
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = (
            PasswordResetToken.objects
            .filter(token=serializer.validated_data['token'])
            .select_related('user')
            .first()
        )
        if token is None or not token.is_valid:
            return Response(
                {'detail': 'This reset link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user = token.user
            user.set_password(serializer.validated_data['password'])
            user.save(update_fields=['password'])
            token.used = True
            token.save(update_fields=['used'])
            _blacklist_all_refresh_tokens(user)

        return Response({'detail': 'Your password has been reset. You can now sign in.'})


# --- sign in with OTP step-up -------------------------------------------------

class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    @extend_schema(
        tags=['Auth'],
        request=LoginSerializer,
        responses={200: OpenApiResponse(description='Credentials valid; OTP emailed.')},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower().strip()
        password = serializer.validated_data['password']

        user = User.objects.filter(email__iexact=email).select_related('profile').first()
        if user is None or not user.check_password(password):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        profile = getattr(user, 'profile', None)
        if not (profile and profile.email_verified):
            return Response(
                {'detail': 'Please verify your email address before signing in.',
                 'code': 'email_unverified'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not user.is_active:
            return Response(
                {'detail': 'Your account is awaiting administrator approval.',
                 'code': 'awaiting_approval'},
                status=status.HTTP_403_FORBIDDEN,
            )

        _issue_otp(user)
        return Response({
            'detail': 'A one-time code has been sent to your email.',
            'otp_token': str(OTPToken.for_user(user)),
        })


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'otp_verify'

    @extend_schema(
        tags=['Auth'],
        request=OTPVerifySerializer,
        responses={200: UserSerializer},
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = get_user_id_from_otp_token(serializer.validated_data['otp_token'])
        except TokenError:
            return Response(
                {'detail': 'Your sign-in session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = User.objects.filter(id=user_id, is_active=True).select_related('profile').first()
        if user is None:
            return Response(
                {'detail': 'Your sign-in session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        otp = OTPCode.objects.filter(user=user, consumed=False).order_by('-created_at').first()
        if otp is None or not otp.verify(serializer.validated_data['code']):
            return Response(
                {'detail': 'Invalid or expired code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data)
        set_jwt_cookies(response, access=str(refresh.access_token), refresh=str(refresh))
        return response


class OTPResendView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'otp_resend'

    @extend_schema(tags=['Auth'], request=OTPResendSerializer)
    def post(self, request):
        serializer = OTPResendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = get_user_id_from_otp_token(serializer.validated_data['otp_token'])
        except TokenError:
            return Response(
                {'detail': 'Your sign-in session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = User.objects.filter(id=user_id, is_active=True).first()
        if user is None:
            return Response(
                {'detail': 'Your sign-in session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        _issue_otp(user)
        return Response({'detail': 'A new one-time code has been sent to your email.'})


# --- session management -------------------------------------------------------

class RefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=['Auth'], request=None)
    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_REFRESH_COOKIE'])
        if not raw_refresh:
            return Response(
                {'detail': 'No active session.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(raw_refresh)
        except TokenError:
            response = Response(
                {'detail': 'Session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_jwt_cookies(response)
            return response

        access = str(refresh.access_token)
        # ROTATE_REFRESH_TOKENS is on, so blacklist the old token and re-issue.
        new_refresh = None
        if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS'):
            try:
                refresh.blacklist()
            except AttributeError:
                pass
            refresh.set_jti()
            refresh.set_exp()
            new_refresh = str(refresh)

        response = Response({'detail': 'Session refreshed.'})
        set_jwt_cookies(response, access=access, refresh=new_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Auth'], request=None)
    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_REFRESH_COOKIE'])
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except (TokenError, AttributeError):
                pass
        response = Response({'detail': 'Signed out.'})
        clear_jwt_cookies(response)
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Auth'], responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# --- admin approval -----------------------------------------------------------

class PendingUsersView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=['Auth'], responses={200: UserSerializer(many=True)})
    def get(self, request):
        users = (
            User.objects
            .filter(is_active=False, profile__email_verified=True)
            .select_related('profile')
            .order_by('date_joined')
        )
        return Response(UserSerializer(users, many=True).data)


class ApproveUserView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=['Auth'], request=None, responses={200: UserSerializer})
    def post(self, request, user_id: int):
        user = get_object_or_404(User, id=user_id)
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])
            send_approved_email(user)
        return Response(UserSerializer(user).data)


class ActiveUsersView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=['Auth'], responses={200: UserSerializer(many=True)})
    def get(self, request):
        users = (
            User.objects
            .filter(is_active=True)
            .select_related('profile')
            .order_by('first_name', 'email')
        )
        return Response(UserSerializer(users, many=True).data)
