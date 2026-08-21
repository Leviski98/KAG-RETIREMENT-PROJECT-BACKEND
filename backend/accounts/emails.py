"""
Transactional auth emails, sent through Resend's dashboard templates.

Each function below maps to one template published in the Resend dashboard
(slug shown under the template name there). Anymail's Resend backend has no
dedicated template API, but it forwards `esp_extra` straight through to
Resend's send-email endpoint, which does accept a `template` object — see
https://resend.com/docs/dashboard/templates/introduction.

In development without RESEND_API_KEY set, EMAIL_BACKEND falls back to the
console backend, which prints `fallback_text` instead of rendering the
template (Resend renders templates server-side, so local dev can't preview them).
"""
from django.conf import settings
from django.core.mail import EmailMessage


def _display_name(user) -> str:
    return user.get_full_name() or user.first_name or user.email


def _send_template_email(*, template_slug: str, to: str, subject: str,
                          fallback_text: str, variables: dict) -> None:
    message = EmailMessage(
        subject=subject,
        body=fallback_text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
    )
    message.esp_extra = {'template': {'id': template_slug, 'variables': variables}}
    message.send(fail_silently=False)


def send_verification_email(user, token: str) -> None:
    link = f'{settings.FRONTEND_URL}/verify-email?token={token}'
    _send_template_email(
        template_slug='user-verifying-email',
        to=user.email,
        subject='Verify your KAG Retirement account',
        fallback_text=f'Confirm your email address to continue setting up your account: {link}',
        variables={'magic_link': link},
    )


def send_password_reset_email(user, token: str) -> None:
    link = f'{settings.FRONTEND_URL}/reset-password?token={token}'
    _send_template_email(
        template_slug='password-reset',
        to=user.email,
        subject='Reset your KAG Retirement password',
        fallback_text=f'Choose a new password: {link}',
        variables={'user_name': _display_name(user), 'reset_link': link},
    )


def send_otp_email(user, code: str) -> None:
    _send_template_email(
        template_slug='otp-email',
        to=user.email,
        subject='Your KAG Retirement sign-in code',
        fallback_text=f'Your one-time sign-in code is: {code}',
        variables={'user_name': _display_name(user), 'OTP': code},
    )


def send_approved_email(user, role_display: str = '') -> None:
    link = f'{settings.FRONTEND_URL}/login'
    _send_template_email(
        template_slug='final-welcome-email',
        to=user.email,
        subject='Your KAG Retirement account is approved',
        fallback_text=f'Your account has been approved. Log in: {link}',
        variables={
            'user_name': _display_name(user),
            'assigned_role': role_display or ('Administrator' if user.is_staff else 'Member'),
            'login': link,
        },
    )


def send_admin_notification_email(user) -> None:
    """Notify the configured admin address that a newly-verified user needs approval."""
    from app_settings.models import SystemSettings

    system_settings, _ = SystemSettings.objects.get_or_create(pk=1)
    admin_email = system_settings.admin_email
    if not admin_email:
        return

    link = f'{settings.FRONTEND_URL}/dashboard/users'
    _send_template_email(
        template_slug='admin-notification-email',
        to=admin_email,
        subject='New user pending approval',
        fallback_text=f'{user.email} verified their email and is awaiting approval: {link}',
        variables={
            'user_email': user.email,
            'registration_date': user.date_joined.strftime('%Y-%m-%d'),
            'approve_link': link,
        },
    )
