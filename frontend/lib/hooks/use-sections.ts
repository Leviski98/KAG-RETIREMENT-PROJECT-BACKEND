/**
 * Section React Query Hooks
 * 
 * Custom hooks for managing section data using TanStack Query.
 * Provides automatic caching, refetching, and mutation handling.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { sectionApi } from '@/lib/api';
import type {
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  SectionStatistics,
  SectionSummary,
  SectionQueryParams,
} from '@/types/section';
import type { PaginatedResponse } from '@/lib/api/client';

/**
 * Query keys for sections
 * Used for cache management and invalidation
 */
export const sectionKeys = {
  all: ['sections'] as const,
  lists: () => [...sectionKeys.all, 'list'] as const,
  list: (params?: SectionQueryParams) => [...sectionKeys.lists(), params] as const,
  details: () => [...sectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...sectionKeys.details(), id] as const,
  statistics: () => [...sectionKeys.all, 'statistics'] as const,
  summary: (id: number) => [...sectionKeys.all, 'summary', id] as const,
};

/**
 * Fetch paginated list of sections
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - React Query options
 */
export function useSections(
  params?: SectionQueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<Section>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: sectionKeys.list(params),
    queryFn: () => sectionApi.getAll(params),
    ...options,
  });
}

/**
 * Fetch a single section by ID
 * 
 * @param id - Section ID
 * @param options - React Query options
 */
export function useSection(
  id: number,
  options?: Omit<UseQueryOptions<Section>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: sectionKeys.detail(id),
    queryFn: () => sectionApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch section statistics
 * 
 * @param options - React Query options
 */
export function useSectionStatistics(
  options?: Omit<UseQueryOptions<SectionStatistics>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: sectionKeys.statistics(),
    queryFn: () => sectionApi.getStatistics(),
    ...options,
  });
}

/**
 * Fetch section summary with additional details
 * 
 * @param id - Section ID
 * @param options - React Query options
 */
export function useSectionSummary(
  id: number,
  options?: Omit<UseQueryOptions<SectionSummary>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: sectionKeys.summary(id),
    queryFn: () => sectionApi.getSummary(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new section
 * Automatically invalidates the sections list on success
 * 
 * @param options - React Query mutation options
 */
export function useCreateSection(
  options?: UseMutationOptions<Section, Error, CreateSectionInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSectionInput) => sectionApi.create(data),
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch sections list
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sectionKeys.statistics() });
      
      // Call user-provided onSuccess if exists
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Update a section (full update)
 * Automatically invalidates related queries on success
 * 
 * @param options - React Query mutation options
 */
export function useUpdateSection(
  options?: UseMutationOptions<Section, Error, { id: number; data: CreateSectionInput }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSectionInput }) =>
      sectionApi.update(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate specific section and lists
      queryClient.invalidateQueries({ queryKey: sectionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sectionKeys.summary(variables.id) });
      
      // Call user-provided onSuccess if exists
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Partially update a section
 * Automatically invalidates related queries on success
 * 
 * @param options - React Query mutation options
 */
export function usePartialUpdateSection(
  options?: UseMutationOptions<Section, Error, { id: number; data: UpdateSectionInput }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionInput }) =>
      sectionApi.partialUpdate(id, data),
    onSuccess: (data, variables, context) => {
      // Invalidate specific section and lists
      queryClient.invalidateQueries({ queryKey: sectionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sectionKeys.summary(variables.id) });
      
      // Call user-provided onSuccess if exists
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Delete a section
 * Automatically invalidates the sections list on success
 * 
 * @param options - React Query mutation options
 */
export function useDeleteSection(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sectionApi.delete(id),
    onSuccess: (data, variables, context) => {
      // Invalidate sections list and statistics
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sectionKeys.statistics() });
      
      // Remove the specific section from cache
      queryClient.removeQueries({ queryKey: sectionKeys.detail(variables) });
      
      // Call user-provided onSuccess if exists
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
