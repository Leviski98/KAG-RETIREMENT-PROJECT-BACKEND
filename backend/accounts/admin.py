from django.contrib import admin

from .models import EmailVerificationToken, OTPCode, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_verified', 'created_at')
    list_filter = ('email_verified',)
    search_fields = ('user__email', 'user__username')


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'used', 'expires_at', 'created_at')
    list_filter = ('used',)
    search_fields = ('user__email',)


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'consumed', 'attempts', 'expires_at', 'created_at')
    list_filter = ('consumed',)
    search_fields = ('user__email',)
