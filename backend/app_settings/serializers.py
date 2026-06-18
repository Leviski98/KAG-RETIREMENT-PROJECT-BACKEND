from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            'id',
            # Organization
            'org_name', 'org_abbreviation', 'admin_name', 'admin_email',
            'admin_phone', 'website', 'postal_address', 'org_logo',
            # Preferences — Regional
            'language', 'date_format', 'timezone', 'currency',
            # Preferences — Retirement Rules
            'retirement_age', 'min_service_years',
            # Preferences — Display
            'fiscal_year_start', 'default_page_size',
            # Notifications
            'notify_new_pastor', 'notify_retirement_alert',
            'notify_contribution_reminders', 'notify_assignment_changes',
            'notify_report_complete', 'notify_system_updates',
            'email_summary_frequency',
            # Account
            'account_display_name', 'account_email', 'account_role',
            # Timestamps
            'updated_at',
        ]
        read_only_fields = ['id', 'account_role', 'updated_at']
