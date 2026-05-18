import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { pastorApi } from '@/lib/api';
import {
  Pastor,
  CreatePastorInput,
  UpdatePastorInput,
  PastorQueryParams,
  PastorStatistics,
  PastorSummary,
  ActivePastorsResponse,
  RetiredPastorsResponse,
} from '@/types/pastor';
import { PaginatedResponse } from '@/lib/api/client';

/**
 * Query keys for pastor-related queries
 */
export const pastorKeys = {
  all: ['pastors'] as const,
  lists: () => [...pastorKeys.all, 'list'] as const,
  list: (params?: PastorQueryParams) => [...pastorKeys.lists(), params] as const,
  details: () => [...pastorKeys.all, 'detail'] as const,
  detail: (id: number) => [...pastorKeys.details(), id] as const,
  statistics: () => [...pastorKeys.all, 'statistics'] as const,
  active: () => [...pastorKeys.all, 'active'] as const,
  retired: () => [...pastorKeys.all, 'retired'] as const,
  summary: (id: number) => [...pastorKeys.all, 'summary', id] as const,
};

/**
 * Hook to fetch paginated list of pastors
 */
export function usePastors(
  params?: PastorQueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<Pastor>>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Pastor>>({
    queryKey: pastorKeys.list(params),
    queryFn: () => pastorApi.getAll(params),
    ...options,
  });
}

/**
 * Hook to fetch a single pastor by ID
 */
export function usePastor(
  id: number,
  options?: Omit<UseQueryOptions<Pastor>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Pastor>({
    queryKey: pastorKeys.detail(id),
    queryFn: () => pastorApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch pastor statistics
 */
export function usePastorStatistics(
  options?: Omit<UseQueryOptions<PastorStatistics>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PastorStatistics>({
    queryKey: pastorKeys.statistics(),
    queryFn: () => pastorApi.getStatistics(),
    ...options,
  });
}

/**
 * Hook to fetch all active pastors
 */
export function useActivePastors(
  options?: Omit<UseQueryOptions<ActivePastorsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ActivePastorsResponse>({
    queryKey: pastorKeys.active(),
    queryFn: () => pastorApi.getActive(),
    ...options,
  });
}

/**
 * Hook to fetch all retired pastors
 */
export function useRetiredPastors(
  options?: Omit<UseQueryOptions<RetiredPastorsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<RetiredPastorsResponse>({
    queryKey: pastorKeys.retired(),
    queryFn: () => pastorApi.getRetired(),
    ...options,
  });
}

/**
 * Hook to fetch pastor summary
 */
export function usePastorSummary(
  id: number,
  options?: Omit<UseQueryOptions<PastorSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PastorSummary>({
    queryKey: pastorKeys.summary(id),
    queryFn: () => pastorApi.getSummary(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new pastor
 */
export function useCreatePastor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePastorInput) => pastorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pastorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.active() });
    },
  });
}

/**
 * Hook to update a pastor (full update)
 */
export function useUpdatePastor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePastorInput }) =>
      pastorApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pastorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pastorKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.active() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.retired() });
    },
  });
}

/**
 * Hook to partially update a pastor
 */
export function usePartialUpdatePastor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UpdatePastorInput> }) =>
      pastorApi.partialUpdate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pastorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pastorKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.active() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.retired() });
    },
  });
}

/**
 * Hook to delete a pastor
 */
export function useDeletePastor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pastorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pastorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.active() });
      queryClient.invalidateQueries({ queryKey: pastorKeys.retired() });
    },
  });
}
