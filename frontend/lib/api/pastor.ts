import { apiClient, PaginatedResponse } from '@/lib/api/client';
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

/**
 * API client for pastor-related endpoints
 */
export const pastorApi = {
  /**
   * Get all pastors with optional filtering and pagination
   */
  getAll: (params?: PastorQueryParams) => {
    return apiClient.get<PaginatedResponse<Pastor>>('/pastors/', params);
  },

  /**
   * Get a single pastor by ID
   */
  getById: (id: number) => {
    return apiClient.get<Pastor>(`/pastors/${id}/`);
  },

  /**
   * Create a new pastor
   */
  create: (data: CreatePastorInput) => {
    return apiClient.post<Pastor>('/pastors/', data);
  },

  /**
   * Update a pastor (full update)
   */
  update: (id: number, data: UpdatePastorInput) => {
    return apiClient.put<Pastor>(`/pastors/${id}/`, data);
  },

  /**
   * Partially update a pastor
   */
  partialUpdate: (id: number, data: Partial<UpdatePastorInput>) => {
    return apiClient.patch<Pastor>(`/pastors/${id}/`, data);
  },

  /**
   * Delete a pastor
   */
  delete: (id: number) => {
    return apiClient.delete<void>(`/pastors/${id}/`);
  },

  /**
   * Get pastor statistics
   */
  getStatistics: () => {
    return apiClient.get<PastorStatistics>('/pastors/statistics/');
  },

  /**
   * Get all active pastors
   */
  getActive: () => {
    return apiClient.get<ActivePastorsResponse>('/pastors/active/');
  },

  /**
   * Get all retired pastors
   */
  getRetired: () => {
    return apiClient.get<RetiredPastorsResponse>('/pastors/retired/');
  },

  /**
   * Get detailed summary for a specific pastor
   */
  getSummary: (id: number) => {
    return apiClient.get<PastorSummary>(`/pastors/${id}/summary/`);
  },
};
