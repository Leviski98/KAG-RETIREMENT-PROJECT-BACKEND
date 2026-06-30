"""
Transactional auth emails.

In development EMAIL_BACKEND is the console backend, so the verification link and
OTP code print to the terminal running `runserver`. In production these go out via
SMTP configured from the environment.
"""
from django.conf import settings
from django.core.mail import send_mail


def _display_name(user) -> str:
    return user.get_full_name() or user.first_name or user.email


def send_verification_email(user, token: str) -> None:
    link = f'{settings.FRONTEND_URL}/verify-email?token={token}'
    send_mail(
        subject='Verify your KAG Retirement account',
        message=(
            f'Hi {_display_name(user)},\n\n'
            f'Confirm your email address to continue setting up your account:\n\n'
            f'{link}\n\n'
            f'This link expires in 24 hours. If you did not sign up, ignore this email.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_otp_email(user, code: str) -> None:
    send_mail(
        subject='Your KAG Retirement sign-in code',
        message=(
            f'Hi {_display_name(user)},\n\n'
            f'Your one-time sign-in code is: {code}\n\n'
            f'It expires in 10 minutes. If you did not try to sign in, change your '
            f'password immediately.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def send_approved_email(user) -> None:
    link = f'{settings.FRONTEND_URL}/login'
    send_mail(
        subject='Your KAG Retirement account is approved',
        message=(
            f'Hi {_display_name(user)},\n\n'
            f'An administrator has approved your account. You can now sign in:\n\n'
            f'{link}'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
