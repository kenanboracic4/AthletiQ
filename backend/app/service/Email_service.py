from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType, NameEmail
from pydantic import EmailStr, SecretStr
import os

mail_username = os.getenv("MAIL_USERNAME")
mail_password = os.getenv("MAIL_PASSWORD")
mail_from = os.getenv("MAIL_FROM")

if not mail_username or not mail_password or not mail_from:
    raise ValueError("MAIL_USERNAME, MAIL_PASSWORD i MAIL_FROM moraju biti postavljeni u .env fajlu")

conf = ConnectionConfig(
    MAIL_USERNAME=mail_username,
    MAIL_PASSWORD=SecretStr(mail_password),
    MAIL_FROM=mail_from,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)
class EmailService:
    @staticmethod
    async def send_notification_email(recipient_email: str, subject: str, body: str):
        message = MessageSchema(
            subject=subject,
            recipients=[NameEmail(name="Pero Perić", email=recipient_email)],
            body=body,
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        await fm.send_message(message)