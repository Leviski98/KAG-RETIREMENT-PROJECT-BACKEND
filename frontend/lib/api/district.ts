/**
 * District API Client
 * 
 * Provides methods to interact with the District API endpoints.
 * All endpoints return Promises that resolve to the expected data type.
 */

import { apiClient, type PaginatedResponse, type ApiRequestError } from '@/lib/api/client';
import type {
  District,
  CreateDistrictInput,
  UpdateDistrictInput,
  DistrictStatistics,
  DistrictSummary,
  BulkCreateDistrictInput,
  DistrictQueryParams,
} from '@/types/district';

const DISTRICTS_ENDPOINT = '/districts/';

/**
 * District API methods
 */
export const districtApi = {
  /**
   * Get paginated list of districts
   * GET /api/districts/
   * 
   * @param params - Query parameters for filtering, searching, and ordering
   * @returns Paginated list of districts
   */
  getAll: (params?: DistrictQueryParams) => {
    return apiClient.get<PaginatedResponse<District>>(DISTRICTS_ENDPOINT, params as Record<string, string | number | boolean | undefined>);
  },

  /**
   * Get a single district by ID
   * GET /api/districts/{id}/
   * 
   * @param id - District ID
   * @returns District details
   */
  getById: (id: number | string) => {
    return apiClient.get<District>(`${DISTRICTS_ENDPOINT}${id}/`);
  },

  /**
   * Create a new district
   * POST /api/districts/
   * 
   * @param data - District data to create
   * @returns Created district
   */
  create: (data: CreateDistrictInput) => {
    return apiClient.post<District>(DISTRICTS_ENDPOINT, data);
  },

  /**
   * Update a district (full update)
   * PUT /api/districts/{id}/
   * 
   * @param id - District ID
   * @param data - Complete district data
   * @returns Updated district
   */
  update: (id: number | string, data: CreateDistrictInput) => {
    return apiClient.put<District>(`${DISTRICTS_ENDPOINT}${id}/`, data);
  },

  /**
   * Partially update a district
   * PATCH /api/districts/{id}/
   * 
   * @param id - District ID
   * @param data - Partial district data to update
   * @returns Updated district
   */
  partialUpdate: (id: number | string, data: UpdateDistrictInput) => {
    return apiClient.patch<District>(`${DISTRICTS_ENDPOINT}${id}/`, data);
  },

  /**
   * Delete a district
   * DELETE /api/districts/{id}/
   * 
   * @param id - District ID
   */
  delete: (id: number | string) => {
    return apiClient.delete<void>(`${DISTRICTS_ENDPOINT}${id}/`);
  },

  /**
   * Get district statistics
   * GET /api/districts/statistics/
   * 
   * @returns Statistics about all districts
   */
  getStatistics: () => {
    return apiClient.get<DistrictStatistics>(`${DISTRICTS_ENDPOINT}statistics/`);
  },

  /**
   * Get detailed summary of a specific district
   * GET /api/districts/{id}/summary/
   * 
   * @param id - District ID
   * @returns District summary with related information
   */
  getSummary: (id: number | string) => {
    return apiClient.get<DistrictSummary>(`${DISTRICTS_ENDPOINT}${id}/summary/`);
  },

  /**
   * Create multiple districts at once (max 10)
   * POST /api/districts/bulk_create/
   * 
   * @param data - Array of districts to create
   * @returns Array of created districts
   */
  bulkCreate: (data: BulkCreateDistrictInput) => {
    return apiClient.post<District[]>(`${DISTRICTS_ENDPOINT}bulk_create/`, data);
  },
};

/**
 * Export individual methods for convenience
 */
export const {
  getAll: getAllDistricts,
  getById: getDistrictById,
  create: createDistrict,
  update: updateDistrict,
  partialUpdate: partialUpdateDistrict,
  delete: deleteDistrict,
  getStatistics: getDistrictStatistics,
  getSummary: getDistrictSummary,
  bulkCreate: bulkCreateDistricts,
} = districtApi;

/**
 * Export the API error class for error handling
 */
export { ApiRequestError };
