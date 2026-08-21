import secrets

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import models
from django.utils import timezone


def _verification_token() -> str:
    """Generate a URL-safe one-time email-verification token."""
    return secrets.token_urlsafe(32)


class UserProfile(models.Model):
    """
    Auxiliary per-user state that doesn't belong on the default User model.

    `email_verified` tracks step 5 of the auth flow (ownership confirmed via the
    one-time link). Admin approval is tracked by the built-in `User.is_active`.

    `role` is the system-access role assigned by an admin at approval time:
    - Administrator: full system access and management.
    - Archbishop: view-only access across all data.
    - Bishop: view-only access, scoped to the districts assigned via `districts`.
    """
    ROLE_ADMIN = 'admin'
    ROLE_ARCHBISHOP = 'archbishop'
    ROLE_BISHOP = 'bishop'
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Administrator'),
        (ROLE_ARCHBISHOP, 'Archbishop'),
        (ROLE_BISHOP, 'Bishop'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    email_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, default='')
    districts = models.ManyToManyField(
        'districts.District',
        blank=True,
        related_name='bishop_profiles',
        help_text='Districts this user (a Bishop) may view. Ignored for other roles.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Profile<{self.user.email or self.user.username}>'


class EmailVerificationToken(models.Model):
    """One-time token emailed at signup to confirm the user owns the address."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='verification_tokens',
    )
    token = models.CharField(max_length=64, unique=True, default=_verification_token)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)

    @classmethod
    def issue(cls, user) -> 'EmailVerificationToken':
        """Invalidate any outstanding tokens and create a fresh one for `user`."""
        cls.objects.filter(user=user, used=False).update(used=True)
        return cls.objects.create(user=user)

    @property
    def is_valid(self) -> bool:
        return not self.used and timezone.now() < self.expires_at

    def __str__(self):
        return f'VerificationToken<{self.user_id}>'


class PasswordResetToken(models.Model):
    """One-time token emailed when a user requests a password reset."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
    )
    token = models.CharField(max_length=64, unique=True, default=_verification_token)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Shorter than the 24h verification window: a reset link grants
            # account access, so it should not linger.
            self.expires_at = timezone.now() + timezone.timedelta(hours=1)
        super().save(*args, **kwargs)

    @classmethod
    def issue(cls, user) -> 'PasswordResetToken':
        """Invalidate any outstanding tokens and create a fresh one for `user`."""
        cls.objects.filter(user=user, used=False).update(used=True)
        return cls.objects.create(user=user)

    @property
    def is_valid(self) -> bool:
        return not self.used and timezone.now() < self.expires_at

    def __str__(self):
        return f'PasswordResetToken<{self.user_id}>'


class OTPCode(models.Model):
    """
    Step-up one-time password emailed after a valid password login.

    The plaintext code is never stored — only a salted hash. Single-use, short-lived,
    and attempt-capped to resist brute force.
    """
    MAX_ATTEMPTS = 5

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='otp_codes',
    )
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    consumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def issue(cls, user, code: str, ttl_minutes: int = 10) -> 'OTPCode':
        """Invalidate any outstanding codes and create a fresh one for `user`."""
        cls.objects.filter(user=user, consumed=False).update(consumed=True)
        return cls.objects.create(
            user=user,
            code_hash=make_password(code),
            expires_at=timezone.now() + timezone.timedelta(minutes=ttl_minutes),
        )

    @property
    def is_valid(self) -> bool:
        return (
            not self.consumed
            and self.attempts < self.MAX_ATTEMPTS
            and timezone.now() < self.expires_at
        )

    def verify(self, code: str) -> bool:
        """Check `code` against the stored hash, recording the attempt."""
        if not self.is_valid:
            return False
        self.attempts += 1
        if check_password(code, self.code_hash):
            self.consumed = True
            self.save(update_fields=['attempts', 'consumed'])
            return True
        self.save(update_fields=['attempts'])
        return False

    def __str__(self):
        return f'OTPCode<{self.user_id}>'
