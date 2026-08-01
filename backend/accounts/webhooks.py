"""
Inbound email webhook — receives Resend's `email.received` events.

Configure this URL as a webhook in the Resend dashboard
(Webhooks > Add Webhook > event type `email.received`) and set
RESEND_WEBHOOK_SECRET to the signing secret shown there.

See https://resend.com/docs/dashboard/receiving/introduction and
https://resend.com/docs/webhooks/verify-webhooks-requests.
"""
import logging

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from svix.webhooks import Webhook, WebhookVerificationError

logger = logging.getLogger(__name__)


class ResendInboundWebhookView(APIView):
    """
    Verifies and processes inbound email events forwarded by Resend.

    Resend signs webhook requests via Svix, so verification needs the raw
    request body (not a re-serialized copy) plus the `svix-*` headers.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        secret = settings.RESEND_WEBHOOK_SECRET
        if not secret:
            logger.error('RESEND_WEBHOOK_SECRET is not configured; rejecting inbound webhook.')
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        headers = {
            'svix-id': request.headers.get('svix-id', ''),
            'svix-timestamp': request.headers.get('svix-timestamp', ''),
            'svix-signature': request.headers.get('svix-signature', ''),
        }

        try:
            event = Webhook(secret).verify(request.body, headers)
        except WebhookVerificationError:
            logger.warning('Rejected inbound webhook with an invalid signature.')
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event.get('type') == 'email.received':
            self._handle_email_received(event.get('data', {}))

        return Response(status=status.HTTP_200_OK)

    def _handle_email_received(self, data: dict) -> None:
        # Webhook payloads only carry metadata; fetch the body/attachments via
        # the Received Emails API (GET /emails/receiving/{email_id}) if needed.
        logger.info(
            'Received inbound email %s from %s to %s: %s',
            data.get('email_id'), data.get('from'), data.get('to'), data.get('subject'),
        )
        # TODO: hook up whatever should happen with inbound mail, e.g. create
        # a support ticket or forward the notification to an admin.
