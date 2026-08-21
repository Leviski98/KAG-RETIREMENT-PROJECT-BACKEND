from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import UserProfile

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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value


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
    role = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    districts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'is_admin',
            'email_verified', 'is_active', 'date_joined',
            'role', 'role_display', 'districts',
        ]
        read_only_fields = fields

    def get_full_name(self, obj) -> str:
        return obj.get_full_name() or obj.first_name or obj.email

    def get_email_verified(self, obj) -> bool:
        profile = getattr(obj, 'profile', None)
        return bool(profile and profile.email_verified)

    def get_role(self, obj) -> str:
        profile = getattr(obj, 'profile', None)
        return profile.role if profile else ''

    def get_role_display(self, obj) -> str:
        profile = getattr(obj, 'profile', None)
        return profile.get_role_display() if profile and profile.role else ''

    def get_districts(self, obj) -> list:
        profile = getattr(obj, 'profile', None)
        if not profile:
            return []
        return [
            {'id': district.id, 'name': district.name}
            for district in profile.districts.all()
        ]


class ApproveUserSerializer(serializers.Serializer):
    """Role (and, for Bishops, district) assignment submitted from the review modal."""
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)
    district_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list,
    )

    def validate(self, attrs):
        if attrs['role'] == UserProfile.ROLE_BISHOP and not attrs.get('district_ids'):
            raise serializers.ValidationError({
                'district_ids': 'Select at least one district for a Bishop.',
            })
        return attrs
