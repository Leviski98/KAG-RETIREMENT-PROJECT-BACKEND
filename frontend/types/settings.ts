export interface SystemSettings {
  id: number;

  // Organization
  org_name: string;
  org_abbreviation: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  website: string;
  postal_address: string;
  org_logo: string;

  // Preferences — Regional
  language: string;
  date_format: string;
  timezone: string;
  currency: string;

  // Preferences — Retirement Rules
  retirement_age: number;
  min_service_years: number;

  // Preferences — Display
  fiscal_year_start: string;
  default_page_size: number;

  // Notifications
  notify_new_pastor: boolean;
  notify_retirement_alert: boolean;
  notify_contribution_reminders: boolean;
  notify_assignment_changes: boolean;
  notify_report_complete: boolean;
  notify_system_updates: boolean;

  // Account
  account_display_name: string;
  account_email: string;
  account_role: string;

  // Timestamps
  updated_at: string;
}

export type UpdateSettingsInput = Partial<
  Omit<SystemSettings, 'id' | 'account_role' | 'updated_at'>
>;

export interface SystemStats {
  districts: number;
  sections: number;
  churches: number;
  pastors: number;
}
