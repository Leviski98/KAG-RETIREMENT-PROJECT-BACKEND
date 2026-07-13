import json
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import UserProfile

User = get_user_model()

DEFAULT_EMAIL = "e2e-admin@kag.test"
DEFAULT_PASSWORD = "E2eTest!2026"


class Command(BaseCommand):
    """
    Seed (or reset) a verified, approved, staff test user for local end-to-end testing.

    The normal signup flow requires an emailed verification link plus admin
    approval (`User.is_active`), and a bare `createsuperuser` account still has
    no `UserProfile`, so it cannot pass the `email_verified` check in
    `LoginView`. There's no fixture/seed mechanism for this in the project, so
    without this command every test run would need to re-drive the full
    signup -> verify -> approve flow (or hand-create a profile in a shell)
    just to reach an authenticated state. Safe to run repeatedly.
    """

    help = "Create or reset a verified, approved, staff test user for end-to-end testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email", default=os.getenv("E2E_ADMIN_EMAIL", DEFAULT_EMAIL),
        )
        parser.add_argument(
            "--password", default=os.getenv("E2E_ADMIN_PASSWORD", DEFAULT_PASSWORD),
        )
        parser.add_argument(
            "--json", action="store_true",
            help=(
                "Print {email, password, access, refresh} instead. The access/refresh "
                "pair is minted directly (bypassing login+OTP) so tooling like a "
                "Playwright global-setup can seed an authenticated storageState "
                "without scripting the OTP step for every run."
            ),
        )

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        password = options["password"]

        user, created = User.objects.get_or_create(
            username=email,
            defaults={"email": email},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        UserProfile.objects.update_or_create(
            user=user, defaults={"email_verified": True},
        )

        if options["json"]:
            refresh = RefreshToken.for_user(user)
            self.stdout.write(json.dumps({
                "email": email,
                "password": password,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }))
            return

        verb = "Created" if created else "Reset"
        self.stdout.write(self.style.SUCCESS(f"{verb} test admin: {email} / {password}"))
