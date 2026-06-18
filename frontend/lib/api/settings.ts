import { apiClient } from '@/lib/api/client';
import type { SystemSettings, SystemStats, UpdateSettingsInput } from '@/types/settings';

const SETTINGS_ENDPOINT = '/settings/';

export const settingsApi = {
  getSettings: (): Promise<SystemSettings> =>
    apiClient.get<SystemSettings>(SETTINGS_ENDPOINT),

  updateSettings: (data: UpdateSettingsInput): Promise<SystemSettings> =>
    apiClient.patch<SystemSettings>(SETTINGS_ENDPOINT, data),

  getStats: (): Promise<SystemStats> =>
    apiClient.get<SystemStats>(`${SETTINGS_ENDPOINT}stats/`),
};
