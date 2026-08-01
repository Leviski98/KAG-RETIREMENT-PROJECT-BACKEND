from django.urls import path

from .views import (
    ApproveUserView,
    LoginView,
    LogoutView,
    MeView,
    OTPResendView,
    OTPVerifyView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PendingUsersView,
    RefreshView,
    ResendVerificationEmailView,
    SignupView,
    VerifyEmailView,
)
from .webhooks import ResendInboundWebhookView

urlpatterns = [
    path('auth/signup', SignupView.as_view(), name='auth-signup'),
    path('auth/verify-email', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('auth/verify-email/resend', ResendVerificationEmailView.as_view(), name='auth-verify-email-resend'),
    path('auth/password-reset', PasswordResetRequestView.as_view(), name='auth-password-reset'),
    path('auth/password-reset/confirm', PasswordResetConfirmView.as_view(), name='auth-password-reset-confirm'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/otp/verify', OTPVerifyView.as_view(), name='auth-otp-verify'),
    path('auth/otp/resend', OTPResendView.as_view(), name='auth-otp-resend'),
    path('auth/refresh', RefreshView.as_view(), name='auth-refresh'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('auth/me', MeView.as_view(), name='auth-me'),
    path('auth/users/pending', PendingUsersView.as_view(), name='auth-users-pending'),
    path('auth/users/<int:user_id>/approve', ApproveUserView.as_view(), name='auth-users-approve'),
    path('webhooks/resend', ResendInboundWebhookView.as_view(), name='webhooks-resend'),
]
