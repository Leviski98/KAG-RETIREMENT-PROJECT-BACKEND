from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from accounts.emails import send_verification_email
from accounts.models import EmailVerificationToken

User = get_user_model()


class Command(BaseCommand):
    """
    Print a fresh, ready-to-click email verification link for a signed-up user.

    The console email backend prints the raw MIME source of the message, and
    quoted-printable transfer encoding always escapes literal '=' as '=3D' and
    soft-wraps long lines with a trailing '=' -- so a verification link (which
    always has a '?token=' in it) reads as corrupted to a human copying it out
    of `docker compose logs` / the runserver terminal. End users have the
    `POST /api/auth/verify-email/resend` endpoint for a stuck signup; this
    command is the equivalent for local/dev use when you need the link
    yourself without reading raw MIME out of the log.
    """

    help = "Issue a fresh email-verification token and print the decoded link for it."

    def add_arguments(self, parser):
        parser.add_argument("email")
        parser.add_argument(
            "--no-send", action="store_true",
            help="Only print the link; skip calling send_verification_email.",
        )

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        user = User.objects.filter(email__iexact=email).select_related("profile").first()
        if user is None:
            raise CommandError(f"No user with email {email!r}.")

        if getattr(user, "profile", None) and user.profile.email_verified:
            self.stdout.write(self.style.WARNING(f"{email} is already verified."))
            return

        token = EmailVerificationToken.issue(user)

        if not options["no_send"]:
            send_verification_email(user, token.token)

        link = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"
        self.stdout.write(self.style.SUCCESS(link))
