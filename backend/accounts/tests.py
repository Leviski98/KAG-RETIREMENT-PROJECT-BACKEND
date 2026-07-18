from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import PasswordResetToken

User = get_user_model()


class PasswordResetRequestTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # ScopedRateThrottle keeps its request history in the cache, which is not
        # reset between tests by default; clear it so throttling from one test
        # can't spill into another.
        cache.clear()
        self.url = reverse('auth-password-reset')
        self.user = User.objects.create_user(
            username='member@kag.test', email='member@kag.test', password='OldStr0ng#Pass1',
        )

    def test_registered_email_gets_a_token_and_email(self):
        response = self.client.post(self.url, {'email': 'member@kag.test'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(PasswordResetToken.objects.filter(user=self.user).count(), 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('reset-password?token=', mail.outbox[0].body)

    def test_email_lookup_is_case_insensitive(self):
        response = self.client.post(self.url, {'email': 'MEMBER@KAG.TEST'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(PasswordResetToken.objects.filter(user=self.user).count(), 1)

    def test_unknown_email_gives_same_response_but_no_token(self):
        registered = self.client.post(self.url, {'email': 'member@kag.test'}, format='json')
        cache.clear()
        unknown = self.client.post(self.url, {'email': 'nobody@kag.test'}, format='json')

        # Identical status + body means the endpoint can't be used to tell which
        # emails have accounts.
        self.assertEqual(unknown.status_code, registered.status_code)
        self.assertEqual(unknown.data, registered.data)
        self.assertFalse(PasswordResetToken.objects.filter(user__email='nobody@kag.test').exists())

    def test_no_email_for_user_without_usable_password(self):
        User.objects.create_user(username='noauth@kag.test', email='noauth@kag.test')  # unusable password
        mail.outbox.clear()

        response = self.client.post(self.url, {'email': 'noauth@kag.test'}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_reissue_invalidates_prior_token(self):
        first = PasswordResetToken.issue(self.user)
        second = PasswordResetToken.issue(self.user)

        first.refresh_from_db()
        self.assertTrue(first.used)
        self.assertFalse(second.used)


class PasswordResetConfirmTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        cache.clear()
        self.url = reverse('auth-password-reset-confirm')
        self.user = User.objects.create_user(
            username='member@kag.test', email='member@kag.test', password='OldStr0ng#Pass1',
        )
        self.token = PasswordResetToken.issue(self.user)

    def test_valid_token_and_strong_password_succeeds(self):
        response = self.client.post(
            self.url, {'token': self.token.token, 'password': 'BrandNew#Pass2026'}, format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNew#Pass2026'))
        self.token.refresh_from_db()
        self.assertTrue(self.token.used)

    def test_weak_password_is_rejected_without_changing_password(self):
        response = self.client.post(
            self.url, {'token': self.token.token, 'password': 'password123'}, format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('OldStr0ng#Pass1'))  # unchanged
        self.token.refresh_from_db()
        self.assertFalse(self.token.used)  # not consumed on failure

    def test_invalid_token_is_rejected(self):
        response = self.client.post(
            self.url, {'token': 'not-a-real-token', 'password': 'BrandNew#Pass2026'}, format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('OldStr0ng#Pass1'))

    def test_used_token_cannot_be_reused(self):
        self.client.post(
            self.url, {'token': self.token.token, 'password': 'BrandNew#Pass2026'}, format='json',
        )
        second = self.client.post(
            self.url, {'token': self.token.token, 'password': 'AnotherNew#Pass2026'}, format='json',
        )

        self.assertEqual(second.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNew#Pass2026'))  # first reset stands

    def test_expired_token_is_rejected(self):
        expired = PasswordResetToken.objects.create(
            user=self.user, expires_at=timezone.now() - timedelta(minutes=1),
        )

        response = self.client.post(
            self.url, {'token': expired.token, 'password': 'BrandNew#Pass2026'}, format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('OldStr0ng#Pass1'))

    def test_reset_revokes_existing_refresh_tokens(self):
        refresh = RefreshToken.for_user(self.user)
        outstanding = OutstandingToken.objects.get(jti=refresh['jti'])
        self.assertFalse(BlacklistedToken.objects.filter(token=outstanding).exists())

        self.client.post(
            self.url, {'token': self.token.token, 'password': 'BrandNew#Pass2026'}, format='json',
        )

        self.assertTrue(BlacklistedToken.objects.filter(token=outstanding).exists())
