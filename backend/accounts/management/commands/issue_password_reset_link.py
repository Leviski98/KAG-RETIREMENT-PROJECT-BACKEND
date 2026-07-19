import json

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import PasswordResetToken, UserProfile

User = get_user_model()

DEFAULT_EMAIL = "e2e-reset@kag.test"
DEFAULT_PASSWORD = "E2eReset!2026"


class Command(BaseCommand):
    """
    Issue a password-reset token and print its ready-to-click link.

    The reset endpoint deliberately never reveals a token (its response is the
    same whether or not the email is registered), and the console email backend
    prints quoted-printable-escaped MIME that mangles the link. So an
    end-to-end test that wants to drive the *success* path has no way to obtain
    a usable token on its own. This command is the reset-flow counterpart to
    `get_verification_link`: it mints a token server-side and prints the decoded
    link, and with --create it seeds a dedicated verified/approved user first so
    the test never has to reset the shared e2e admin (whose session other specs
    depend on). Safe to run repeatedly.
    """

    help = "Issue a password-reset token and print the decoded reset link."

    def add_arguments(self, parser):
        parser.add_argument("--email", default=DEFAULT_EMAIL)
        parser.add_argument(
            "--create", action="store_true",
            help="Create the user (verified + active, known password) if it does not exist.",
        )
        parser.add_argument(
            "--json", action="store_true",
            help="Print {email, token, link} as JSON instead of just the link.",
        )

    def handle(self, *args, **options):
        email = options["email"].strip().lower()

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            if not options["create"]:
                self.stderr.write(f"No user with email {email!r}. Pass --create to seed one.")
                return
            user = User.objects.create_user(
                username=email, email=email, password=DEFAULT_PASSWORD, is_active=True,
            )
            UserProfile.objects.update_or_create(user=user, defaults={"email_verified": True})

        token = PasswordResetToken.issue(user)
        link = f"{settings.FRONTEND_URL}/reset-password?token={token.token}"

        if options["json"]:
            self.stdout.write(json.dumps({"email": email, "token": token.token, "link": link}))
        else:
            self.stdout.write(self.style.SUCCESS(link))
