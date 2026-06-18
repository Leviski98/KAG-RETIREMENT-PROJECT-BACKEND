from django.contrib import admin
from .models import SystemSettings


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['id', 'org_name', 'admin_email', 'updated_at']
    readonly_fields = ['id', 'updated_at']
    fieldsets = [
        ('Organization', {
            'fields': ['org_name', 'org_abbreviation', 'admin_name',
                       'admin_email', 'admin_phone', 'website', 'postal_address'],
        }),
        ('Preferences — Regional', {
            'fields': ['language', 'date_format', 'timezone', 'currency'],
        }),
        ('Preferences — Retirement Rules', {
            'fields': ['retirement_age', 'min_service_years'],
        }),
        ('Preferences — Display', {
            'fields': ['fiscal_year_start', 'default_page_size'],
        }),
        ('Notifications', {
            'fields': ['notify_new_pastor', 'notify_retirement_alert',
                       'notify_contribution_reminders', 'notify_assignment_changes',
                       'notify_report_complete', 'notify_system_updates',
                       'email_summary_frequency'],
        }),
        ('Account', {
            'fields': ['account_display_name', 'account_email', 'account_role'],
        }),
        ('Timestamps', {
            'fields': ['updated_at'],
        }),
    ]
