from django.db import models


class SystemSettings(models.Model):
    # Organization
    org_name = models.CharField(max_length=200, default='Kenya Assemblies of God')
    org_abbreviation = models.CharField(max_length=20, default='KAG')
    admin_name = models.CharField(max_length=150, default='')
    admin_email = models.EmailField(default='')
    admin_phone = models.CharField(max_length=20, default='')
    website = models.CharField(max_length=200, default='', blank=True)
    postal_address = models.TextField(default='', blank=True)
    org_logo = models.TextField(default='', blank=True)  # base64 data URL

    # Preferences — Regional
    language = models.CharField(max_length=50, default='English')
    date_format = models.CharField(max_length=20, default='DD/MM/YYYY')
    timezone = models.CharField(max_length=60, default='Africa/Nairobi')
    currency = models.CharField(max_length=50, default='KES')

    # Preferences — Retirement Rules
    retirement_age = models.PositiveIntegerField(default=65)
    min_service_years = models.PositiveIntegerField(default=10)

    # Preferences — Display
    fiscal_year_start = models.CharField(max_length=20, default='January')
    default_page_size = models.PositiveIntegerField(default=10)

    # Notifications
    notify_new_pastor = models.BooleanField(default=True)
    notify_retirement_alert = models.BooleanField(default=True)
    notify_contribution_reminders = models.BooleanField(default=True)
    notify_assignment_changes = models.BooleanField(default=False)
    notify_report_complete = models.BooleanField(default=True)
    notify_system_updates = models.BooleanField(default=False)
    email_summary_frequency = models.CharField(
        max_length=10,
        choices=[('Daily', 'Daily'), ('Weekly', 'Weekly'), ('Monthly', 'Monthly')],
        default='Daily',
    )

    # Account
    account_display_name = models.CharField(max_length=150, default='System Administrator')
    account_email = models.EmailField(default='')
    account_role = models.CharField(max_length=50, default='Super Admin')

    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f'System Settings (updated: {self.updated_at})'
