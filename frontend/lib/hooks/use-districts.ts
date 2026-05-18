/**
 * District Hooks
 *
 * Custom React hooks for managing district data using TanStack Query.
 * Provides easy-to-use hooks for fetching, creating, updating, and deleting districts.
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { districtApi, type PaginatedResponse, type ApiRequestError } from '@/lib/api';
import type {
  District,
  CreateDistrictInput,
  UpdateDistrictInput,
  DistrictStatistics,
  DistrictSummary,
  BulkCreateDistrictInput,
  DistrictQueryParams,
} from '@/types/district';

/**
 * Query keys for district-related queries
 */
export const districtKeys = {
  all: ['districts'] as const,
  lists: () => [...districtKeys.all, 'list'] as const,
  list: (params?: DistrictQueryParams) => [...districtKeys.lists(), params] as const,
  details: () => [...districtKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...districtKeys.details(), id] as const,
  statistics: () => [...districtKeys.all, 'statistics'] as const,
  summary: (id: number | string) => [...districtKeys.all, 'summary', id] as const,
};

/**
 * Hook to fetch paginated list of districts
 *
 * @param params - Query parameters for filtering, searching, and ordering
 * @param options - Additional react-query options
 * @returns Query result with district list
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDistricts({ search: 'Nairobi', page: 1 });
 * ```
 */
export function useDistricts(
  params?: DistrictQueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<District>, ApiRequestError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: districtKeys.list(params),
    queryFn: () => districtApi.getAll(params),
    ...options,
  });
}

/**
 * Hook to fetch a single district by ID
 *
 * @param id - District ID
 * @param options - Additional react-query options
 * @returns Query result with district details
 *
 * @example
 * ```tsx
 * const { data: district, isLoading } = useDistrict(1);
 * ```
 */
export function useDistrict(
  id: number | string,
  options?: Omit<UseQueryOptions<District, ApiRequestError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: districtKeys.detail(id),
    queryFn: () => districtApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch district statistics
 *
 * @param options - Additional react-query options
 * @returns Query result with district statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = useDistrictStatistics();
 * console.log(stats.total_districts);
 * ```
 */
export function useDistrictStatistics(
  options?: Omit<UseQueryOptions<DistrictStatistics, ApiRequestError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: districtKeys.statistics(),
    queryFn: () => districtApi.getStatistics(),
    ...options,
  });
}

/**
 * Hook to fetch a district summary
 *
 * @param id - District ID
 * @param options - Additional react-query options
 * @returns Query result with district summary
 *
 * @example
 * ```tsx
 * const { data: summary } = useDistrictSummary(1);
 * ```
 */
export function useDistrictSummary(
  id: number | string,
  options?: Omit<UseQueryOptions<DistrictSummary, ApiRequestError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: districtKeys.summary(id),
    queryFn: () => districtApi.getSummary(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new district
 *
 * @param options - Additional react-query mutation options
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const createMutation = useCreateDistrict();
 *
 * const handleSubmit = (data: CreateDistrictInput) => {
 *   createMutation.mutate(data, {
 *     onSuccess: () => console.log('District created!'),
 *   });
 * };
 * ```
 */
export function useCreateDistrict(
  options?: UseMutationOptions<District, ApiRequestError, CreateDistrictInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: districtApi.create,
    onSuccess: () => {
      // Invalidate and refetch district lists
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.statistics() });
    },
    ...options,
  });
}

/**
 * Hook to update a district (full update)
 *
 * @param options - Additional react-query mutation options
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateDistrict();
 *
 * const handleUpdate = (id: number, data: CreateDistrictInput) => {
 *   updateMutation.mutate({ id, data });
 * };
 * ```
 */
export function useUpdateDistrict(
  options?: UseMutationOptions<
    District,
    ApiRequestError,
    { id: number | string; data: CreateDistrictInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => districtApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the cached district
      queryClient.setQueryData(districtKeys.detail(variables.id), data);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to partially update a district
 *
 * @param options - Additional react-query mutation options
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const patchMutation = usePartialUpdateDistrict();
 *
 * const handlePatch = (id: number, data: UpdateDistrictInput) => {
 *   patchMutation.mutate({ id, data });
 * };
 * ```
 */
export function usePartialUpdateDistrict(
  options?: UseMutationOptions<
    District,
    ApiRequestError,
    { id: number | string; data: UpdateDistrictInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => districtApi.partialUpdate(id, data),
    onSuccess: (data, variables) => {
      // Update the cached district
      queryClient.setQueryData(districtKeys.detail(variables.id), data);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a district
 *
 * @param options - Additional react-query mutation options
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteDistrict();
 *
 * const handleDelete = (id: number) => {
 *   deleteMutation.mutate(id, {
 *     onSuccess: () => console.log('District deleted!'),
 *   });
 * };
 * ```
 */
export function useDeleteDistrict(
  options?: UseMutationOptions<void, ApiRequestError, number | string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: districtApi.delete,
    onSuccess: (_data, variables) => {
      // Remove the district from cache
      queryClient.removeQueries({ queryKey: districtKeys.detail(variables) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.statistics() });
    },
    ...options,
  });
}

/**
 * Hook to bulk create multiple districts
 *
 * @param options - Additional react-query mutation options
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const bulkCreateMutation = useBulkCreateDistricts();
 *
 * const handleBulkCreate = () => {
 *   bulkCreateMutation.mutate({
 *     districts: [
 *       { name: 'District 1' },
 *       { name: 'District 2' },
 *     ],
 *   });
 * };
 * ```
 */
export function useBulkCreateDistricts(
  options?: UseMutationOptions<District[], ApiRequestError, BulkCreateDistrictInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: districtApi.bulkCreate,
    onSuccess: () => {
      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: districtKeys.statistics() });
    },
    ...options,
  });
}
