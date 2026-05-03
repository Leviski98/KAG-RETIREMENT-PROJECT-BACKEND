// Pastor status options
export const PASTOR_STATUS = {
  ACTIVE: 'active',
  RETIRED: 'retired',
  DECEASED: 'deceased',
} as const;

export const PASTOR_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'retired', label: 'Retired' },
  { value: 'deceased', label: 'Deceased' },
];

export const PASTOR_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  retired: 'Retired',
  deceased: 'Deceased',
};
