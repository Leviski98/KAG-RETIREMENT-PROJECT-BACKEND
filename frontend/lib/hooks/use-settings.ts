import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import type { UpdateSettingsInput } from '@/types/settings';

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
  stats: () => [...settingsKeys.all, 'stats'] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => settingsApi.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.detail(), updatedSettings);
    },
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: settingsKeys.stats(),
    queryFn: settingsApi.getStats,
    staleTime: 60 * 1000,
  });
}
