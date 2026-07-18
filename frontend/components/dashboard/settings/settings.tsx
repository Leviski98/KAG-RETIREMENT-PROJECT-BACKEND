"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Bell,
  Building2,
  Calendar,
  Database,
  Heart,
  Info,
  Save,
  Shield,
  SlidersHorizontal,
  Upload,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSettings, useUpdateSettings, useSystemStats } from "@/lib/hooks/use-settings";
import { ApiRequestError } from "@/lib/api/client";
import type { SystemSettings, UpdateSettingsInput } from "@/types/settings";

type SettingsTabId =
  | "organization"
  | "preferences"
  | "notifications"
  | "account"
  | "data"
  | "about";

type SettingsTab = {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
};

type FieldProps = {
  label: string;
  value: string;
  type?: string;
  helper?: string;
  disabled?: boolean;
  optional?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type SelectFieldProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  options?: string[];
  onChange?: (value: string) => void;
};

const settingsTabs: SettingsTab[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: UserCog },
  { id: "about", label: "About", icon: Info },
];

const NOTIFICATION_KEYS = [
  {
    key: "notify_new_pastor" as const,
    title: "New Pastor Registration",
    description: "Receive a notification when a new pastor is added to the system.",
  },
  {
    key: "notify_retirement_alert" as const,
    title: "Retirement Eligibility Alert",
    description: "Get notified when a pastor reaches retirement age or service threshold.",
  },
  {
    key: "notify_assignment_changes" as const,
    title: "Assignment Changes",
    description: "Notifications when pastor assignments are created or modified.",
  },
  {
    key: "notify_report_complete" as const,
    title: "Report Generation Complete",
    description: "Get notified when a generated report is ready for download.",
  },
  {
    key: "notify_system_updates" as const,
    title: "System Updates",
    description: "Important announcements about system maintenance and feature updates.",
  },
] as const;

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded-lg bg-[#eef2f7]" />
        <div className="mt-2 h-5 w-80 rounded-lg bg-[#eef2f7]" />
      </div>
      <div className="h-[650px] rounded-2xl bg-[#eef2f7]" />
    </div>
  );
}

function SettingsError() {
  return (
    <div className="rounded-xl border border-[#ff9bb2] bg-[#fff4f7] p-6 text-[#ff3b6b] text-sm font-semibold">
      Failed to load settings. Please refresh the page.
    </div>
  );
}

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("organization");
  const { data: settings, isLoading, isError } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  if (isLoading) return <SettingsSkeleton />;
  if (isError || !settings) return <SettingsError />;

  const handleSave = (tab: string) => (data: UpdateSettingsInput) => {
    updateSettings(data, {
      onSuccess: () => toast.success(`${tab} settings saved.`),
      onError: (error: unknown) => {
        if (error instanceof ApiRequestError) {
          if (error.status === 0) {
            toast.error(`[${tab}] Network error — check your connection and try again.`);
          } else if (error.status >= 400 && error.status < 500) {
            toast.error(`[${tab}] Validation error: ${error.message}`);
          } else if (error.status >= 500) {
            toast.error(`[${tab}] Server error (${error.status}) — please try again later.`);
          } else {
            toast.error(`[${tab}] Failed to save: ${error.message}`);
          }
        } else {
          toast.error(`[${tab}] Unexpected error — please refresh and try again.`);
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-[28px] font-extrabold tracking-normal text-[#111827]">
          Settings
        </h1>
        <p className="mt-1 text-[15px] leading-6 text-[#607391]">
          Configure system preferences, manage your organization profile, and
          control notifications.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          role="tablist"
        >
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                className={cn(
                  "flex h-11 min-w-fit items-center gap-3 rounded-xl border-l-2 border-transparent px-4 text-sm font-semibold text-[#58708f] transition-colors lg:w-full",
                  isActive
                    ? "border-[#3377ff] bg-[#eaf1ff] text-[#3377ff]"
                    : "hover:bg-[#f3f6fa] hover:text-[#3377ff]"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="size-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <Card className="min-h-[650px] rounded-2xl border-[#eef2f7] bg-white py-0 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
          <CardContent
            id={`${activeTab}-panel`}
            role="tabpanel"
            className="px-7 py-8"
          >
            {activeTab === "organization" && (
              <OrganizationPanel settings={settings} onSave={handleSave("Organization")} isSaving={isPending} />
            )}
            {activeTab === "preferences" && (
              <PreferencesPanel settings={settings} onSave={handleSave("Preferences")} isSaving={isPending} />
            )}
            {activeTab === "notifications" && (
              <NotificationsPanel settings={settings} onSave={handleSave("Notifications")} isSaving={isPending} />
            )}
            {activeTab === "account" && (
              <AccountPanel settings={settings} onSave={handleSave("Account")} isSaving={isPending} />
            )}
            {activeTab === "data" && <DataManagementPanel />}
            {activeTab === "about" && <AboutPanel />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff]">
        <Icon className="size-5 text-[#3377ff]" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-[#333333]">{title}</h2>
        <p className="text-sm leading-6 text-[#607391]">{description}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-4 text-sm font-extrabold uppercase tracking-normal text-[#3377ff]">
      {children}
    </h3>
  );
}

function TextField({ label, value, type = "text", helper, disabled, optional, error, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#444444]">
        {label}
        {optional && (
          <span className="rounded border border-[#dbe4f0] bg-[#f3f6fa] px-1.5 py-0.5 text-[10px] font-bold text-[#9aabc4]">
            Optional
          </span>
        )}
      </span>
      <Input
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange ?? (() => {})}
        className={cn(
          "h-12 rounded-lg border-[#9fb0c5] bg-[#fbfcff] px-4 text-sm text-[#444444]",
          error && "border-[#ff3b6b] focus-visible:ring-[#ff3b6b]/20"
        )}
      />
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-[#ff3b6b]">{error}</span>
      ) : helper ? (
        <span className="mt-2 block text-xs font-medium text-[#9aabc4]">{helper}</span>
      ) : null}
    </label>
  );
}

function SelectField({ label, value, icon: Icon, options = [], onChange }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-[#444444]">
        {Icon ? <Icon className="size-4 text-[#8ca0bb]" /> : null}
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-12 w-full rounded-lg border border-[#9fb0c5] bg-[#fbfcff] px-4 text-sm text-[#444444] outline-none transition-colors focus:border-[#3377ff] focus:ring-3 focus:ring-[#3377ff]/20"
      >
        {options.length > 0 ? (
          options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))
        ) : (
          <option value={value}>{value}</option>
        )}
      </select>
    </label>
  );
}

function SaveFooter({
  label,
  onSave,
  isSaving,
}: {
  label: string;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="mt-8 flex justify-end border-t border-[#dbe4f0] pt-6">
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="h-11 min-w-[150px] rounded-lg bg-[#3377ff] px-6 text-sm font-extrabold text-white hover:bg-[#2f6eea]"
      >
        <Save className="size-4" />
        {isSaving ? "Saving..." : label}
      </Button>
    </div>
  );
}

type PanelProps = {
  settings: SystemSettings;
  onSave: (data: UpdateSettingsInput) => void;
  isSaving: boolean;
};

function OrganizationPanel({ settings, onSave, isSaving }: PanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    org_name: settings.org_name,
    org_abbreviation: settings.org_abbreviation,
    admin_name: settings.admin_name,
    admin_email: settings.admin_email,
    admin_phone: settings.admin_phone,
    website: settings.website,
    postal_address: settings.postal_address,
    org_logo: settings.org_logo,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const clearError = (field: keyof typeof form) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      clearError(field);
    };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, org_logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof form, string>> = {};
    if (!form.org_name.trim()) next.org_name = 'Organization name is required.';
    if (!form.org_abbreviation.trim()) next.org_abbreviation = 'Abbreviation is required.';
    if (!form.admin_name.trim()) next.admin_name = 'Administrator name is required.';
    if (!form.admin_email.trim()) {
      next.admin_email = 'Admin email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) {
      next.admin_email = 'Enter a valid email address.';
    }
    if (!form.admin_phone.trim()) next.admin_phone = 'Admin phone number is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div>
      <PanelHeader
        icon={Building2}
        title="Organization Profile"
        description="Manage your church organization details and branding."
      />

      <div className="mb-7 flex items-center gap-5 rounded-lg border border-[#dbe4f0] bg-[#f7f8fa] p-5">
        {form.org_logo ? (
          <Image
            src={form.org_logo}
            alt="Organization logo"
            width={64}
            height={64}
            unoptimized
            className="size-16 rounded-xl object-cover"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-xl bg-[#3377ff] text-2xl font-extrabold text-white">
            {form.org_abbreviation || "KAG"}
          </div>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg"
            className="hidden"
            onChange={handleLogoSelect}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 rounded-lg border-[#dbe4f0] bg-white px-4 text-sm font-bold text-[#444444]"
          >
            <Upload className="size-4" />
            Upload Logo
          </Button>
          <p className="mt-2 text-xs font-medium text-[#9aabc4]">
            PNG, SVG or JPG — recommended 200×200 px
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Organization Name" value={form.org_name} onChange={handleChange("org_name")} error={errors.org_name} />
        <TextField label="Abbreviation" value={form.org_abbreviation} onChange={handleChange("org_abbreviation")} error={errors.org_abbreviation} />
        <TextField label="Administrator Name" value={form.admin_name} onChange={handleChange("admin_name")} error={errors.admin_name} />
        <TextField label="Admin Email" type="email" value={form.admin_email} onChange={handleChange("admin_email")} error={errors.admin_email} />
        <TextField label="Admin Phone" value={form.admin_phone} onChange={handleChange("admin_phone")} error={errors.admin_phone} />
        <TextField label="Website" value={form.website} onChange={handleChange("website")} optional />
        <div className="md:col-span-2">
          <TextField label="Postal Address" value={form.postal_address} onChange={handleChange("postal_address")} optional />
        </div>
      </div>

      <SaveFooter label="Save Changes" onSave={() => { if (validate()) onSave(form); }} isSaving={isSaving} />
    </div>
  );
}

function PreferencesPanel({ settings, onSave, isSaving }: PanelProps) {
  const [form, setForm] = useState({
    language: settings.language,
    date_format: settings.date_format,
    timezone: settings.timezone,
    currency: settings.currency,
    retirement_age: String(settings.retirement_age),
    min_service_years: String(settings.min_service_years),
    fiscal_year_start: settings.fiscal_year_start,
    default_page_size: String(settings.default_page_size),
  });
  const [errors, setErrors] = useState<Partial<Record<'retirement_age' | 'min_service_years', string>>>({});

  const set = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'retirement_age' || field === 'min_service_years') {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    const age = Number(form.retirement_age);
    const svc = Number(form.min_service_years);
    if (!form.retirement_age || isNaN(age) || age < 1) next.retirement_age = 'Enter a valid retirement age (e.g. 65).';
    if (!form.min_service_years || isNaN(svc) || svc < 1) next.min_service_years = 'Enter a valid number of service years.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      language: form.language,
      date_format: form.date_format,
      timezone: form.timezone,
      currency: form.currency,
      retirement_age: Number(form.retirement_age),
      min_service_years: Number(form.min_service_years),
      fiscal_year_start: form.fiscal_year_start,
      default_page_size: Number(form.default_page_size),
    });
  };

  return (
    <div>
      <PanelHeader
        icon={SlidersHorizontal}
        title="System Preferences"
        description="Configure regional settings, retirement rules, and display options."
      />

      <SectionTitle>Regional Settings</SectionTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          label="Language"
          value={form.language}
          options={["English", "Swahili"]}
          onChange={set("language")}
        />
        <SelectField
          label="Date Format"
          value={form.date_format}
          icon={Calendar}
          options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
          onChange={set("date_format")}
        />
        <SelectField
          label="Timezone"
          value={form.timezone}
          options={["Africa/Nairobi", "UTC"]}
          onChange={set("timezone")}
        />
        <SelectField
          label="Currency"
          value={form.currency}
          options={["KES", "USD"]}
          onChange={set("currency")}
        />
      </div>

      <div className="mt-8">
        <SectionTitle>Retirement Rules</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Retirement Age"
            value={form.retirement_age}
            helper="Pastors reaching this age will be flagged for retirement."
            error={errors.retirement_age}
            onChange={(e) => set("retirement_age")(e.target.value)}
          />
          <TextField
            label="Minimum Service Years"
            value={form.min_service_years}
            helper="Minimum years of service required for retirement eligibility."
            error={errors.min_service_years}
            onChange={(e) => set("min_service_years")(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle>Display Options</SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Fiscal Year Start"
            value={form.fiscal_year_start}
            icon={Calendar}
            options={["January", "April", "July", "October"]}
            onChange={set("fiscal_year_start")}
          />
          <SelectField
            label="Default Page Size"
            value={form.default_page_size}
            icon={SlidersHorizontal}
            options={["10", "25", "50", "100"]}
            onChange={set("default_page_size")}
          />
        </div>
      </div>

      <SaveFooter label="Save Preferences" onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}

function NotificationsPanel({ settings, onSave, isSaving }: PanelProps) {
  type NotifKey = (typeof NOTIFICATION_KEYS)[number]["key"];

  const [form, setForm] = useState<Record<NotifKey, boolean>>({
    notify_new_pastor: settings.notify_new_pastor,
    notify_retirement_alert: settings.notify_retirement_alert,
    notify_assignment_changes: settings.notify_assignment_changes,
    notify_report_complete: settings.notify_report_complete,
    notify_system_updates: settings.notify_system_updates,
  });

  const toggle = (key: NotifKey) =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div>
      <PanelHeader
        icon={Bell}
        title="Notification Settings"
        description="Control which notifications you receive and how they are delivered."
      />

      <div className="space-y-2">
        {NOTIFICATION_KEYS.map(({ key, title, description }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-5 rounded-lg border border-[#dbe4f0] bg-[#fbfcff] px-4 py-3"
          >
            <div>
              <h3 className="text-sm font-extrabold text-[#444444]">{title}</h3>
              <p className="mt-1 text-xs font-medium text-[#607391]">{description}</p>
            </div>
            <ToggleSwitch checked={form[key]} onToggle={() => toggle(key)} label={title} />
          </div>
        ))}
      </div>

      <SaveFooter label="Save Notifications" onSave={() => onSave(form)} isSaving={isSaving} />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-[#3377ff]" : "bg-[#dfe8f1]"
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

function AccountPanel({ settings, onSave, isSaving }: PanelProps) {
  const [form, setForm] = useState({
    account_display_name: settings.account_display_name,
    account_email: settings.account_email,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const clearError = (field: keyof typeof form) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.account_display_name.trim()) next.account_display_name = 'Display name is required.';
    if (!form.account_email.trim()) {
      next.account_email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.account_email)) {
      next.account_email = 'Enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const initials = form.account_display_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SA";

  return (
    <div>
      <PanelHeader
        icon={UserCog}
        title="Account Settings"
        description="Manage your profile information."
      />

      <div className="mb-7 flex items-center gap-5 rounded-lg border border-[#dbe4f0] bg-[#f7f8fa] p-5">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#3377ff] text-2xl font-extrabold text-white">
          {initials}
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-[#444444]">
            {form.account_display_name}
          </h3>
          <p className="text-sm text-[#607391]">{form.account_email}</p>
          <Badge className="mt-2 rounded-md bg-[#eaf1ff] text-[#3377ff]">
            <Shield className="size-3" />
            {settings.account_role}
          </Badge>
        </div>
      </div>

      <SectionTitle>Profile Information</SectionTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          label="Display Name"
          value={form.account_display_name}
          error={errors.account_display_name}
          onChange={(e) => { setForm((prev) => ({ ...prev, account_display_name: e.target.value })); clearError("account_display_name"); }}
        />
        <TextField
          label="Email Address"
          type="email"
          value={form.account_email}
          error={errors.account_email}
          onChange={(e) => { setForm((prev) => ({ ...prev, account_email: e.target.value })); clearError("account_email"); }}
        />
        <TextField
          label="Role"
          value={settings.account_role}
          disabled
          helper="Role can only be changed by another Super Admin."
        />
      </div>

      <SaveFooter label="Save Account" onSave={() => { if (validate()) onSave(form); }} isSaving={isSaving} />
    </div>
  );
}

function DataManagementPanel() {
  return (
    <div>
      <PanelHeader
        icon={Database}
        title="Data Management"
        description="Export, import, and manage your organization's data."
      />

      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#dbe4f0] bg-[#f7f8fa] py-16 text-center">
        <Database className="size-10 text-[#9aabc4]" />
        <div>
          <h3 className="text-base font-extrabold text-[#444444]">Coming Soon</h3>
          <p className="mt-1 text-sm text-[#607391]">
            Data export, import, and storage analytics are under development.
          </p>
        </div>
      </div>
    </div>
  );
}

function AboutPanel() {
  const { data: stats } = useSystemStats();

  const statItems = [
    { label: "Districts", value: stats?.districts ?? "—" },
    { label: "Sections", value: stats?.sections ?? "—" },
    { label: "Churches", value: stats?.churches ?? "—" },
    { label: "Pastors", value: stats?.pastors ?? "—" },
  ];

  return (
    <div>
      <PanelHeader
        icon={Info}
        title="About"
        description="System information and version details."
      />

      <div className="rounded-xl bg-gradient-to-r from-[#3377ff] to-[#2d60bf] px-6 py-8 text-center text-white">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-extrabold">
          KAG
        </div>
        <h3 className="text-2xl font-extrabold">
          KAG Retirement Management System
        </h3>
        <p className="mt-2 text-sm font-bold text-white/80">
          Kenya Assemblies of God
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-extrabold">
            Version 1.0.0
          </span>
          <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-extrabold">
            March 2026
          </span>
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle>System Statistics</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[#dbe4f0] bg-[#f7f8fa] px-4 py-5 text-center"
            >
              <p className="text-2xl font-extrabold text-[#444444]">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-[#607391]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-[#dbe4f0] pt-7 text-center text-sm font-medium text-[#9aabc4]">
        Made with <Heart className="inline size-4 fill-[#ff3b6b] text-[#ff3b6b]" /> for
        the KAG community
      </div>
    </div>
  );
}
