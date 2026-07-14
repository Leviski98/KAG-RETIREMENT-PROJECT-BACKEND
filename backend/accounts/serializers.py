from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    otp_token = serializers.CharField()
    code = serializers.RegexField(r'^\d{6}$', error_messages={
        'invalid': 'Enter the 6-digit code from your email.',
    })


class OTPResendSerializer(serializers.Serializer):
    otp_token = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    """Public-facing user shape for /me and the admin pending list."""
    full_name = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(source='is_staff', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'is_admin',
            'email_verified', 'is_active', 'date_joined',
        ]
        read_only_fields = fields

    def get_full_name(self, obj) -> str:
        return obj.get_full_name() or obj.first_name or obj.email

    def get_email_verified(self, obj) -> bool:
        profile = getattr(obj, 'profile', None)
        return bool(profile and profile.email_verified)
