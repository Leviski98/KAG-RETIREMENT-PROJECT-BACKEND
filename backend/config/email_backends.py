from django.core.mail.backends.console import EmailBackend as ConsoleEmailBackend


class PlainTextConsoleEmailBackend(ConsoleEmailBackend):
    """
    Local-dev console backend that prints the plain subject/body instead of
    the raw MIME source.

    The stock console backend prints `message.message().as_bytes()`, and
    Django always quoted-printable-encodes utf-8 email bodies (see
    django.core.mail.message.SafeMIMEText), so any link in the body gets
    escaped ('=' becomes '=3D') and soft-wrapped at 76 columns. Real mail
    clients decode that invisibly, but a human copying a link straight out of
    `docker compose logs` / the runserver terminal gets a corrupted, unusable
    token. This backend sidesteps MIME encoding for local debugging so the
    link in the log is always the literal, clickable one.
    """

    def write_message(self, message):
        self.stream.write(f'Subject: {message.subject}\n')
        self.stream.write(f'From: {message.from_email}\n')
        self.stream.write(f'To: {", ".join(message.to)}\n\n')
        self.stream.write(f'{message.body}\n')
        self.stream.write('-' * 79 + '\n')
