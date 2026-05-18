/**
 * Section API Client
 * 
 * Provides methods to interact with the Section API endpoints.
 * All endpoints return Promises that resolve to the expected data type.
 */

import { apiClient, type PaginatedResponse } from '@/lib/api/client';
import type {
  Section,
  CreateSectionInput,
  UpdateSectionInput,
  SectionStatistics,
  SectionSummary,
  SectionQueryParams,
} from '@/types/section';

const SECTIONS_ENDPOINT = '/sections/';

/**
 * Section API methods
 */
export const sectionApi = {
  /**
   * Get paginated list of sections
   * GET /api/sections/
   * 
   * @param params - Query parameters for filtering, searching, and ordering
   * @returns Paginated list of sections
   */
  getAll: (params?: SectionQueryParams) => {
    return apiClient.get<PaginatedResponse<Section>>(SECTIONS_ENDPOINT, params as Record<string, string | number | boolean | undefined>);
  },

  /**
   * Get a single section by ID
   * GET /api/sections/{id}/
   * 
   * @param id - Section ID
   * @returns Section details
   */
  getById: (id: number | string) => {
    return apiClient.get<Section>(`${SECTIONS_ENDPOINT}${id}/`);
  },

  /**
   * Create a new section
   * POST /api/sections/
   * 
   * @param data - Section data to create
   * @returns Created section
   */
  create: (data: CreateSectionInput) => {
    return apiClient.post<Section>(SECTIONS_ENDPOINT, data);
  },

  /**
   * Update a section (full update)
   * PUT /api/sections/{id}/
   * 
   * @param id - Section ID
   * @param data - Complete section data
   * @returns Updated section
   */
  update: (id: number | string, data: CreateSectionInput) => {
    return apiClient.put<Section>(`${SECTIONS_ENDPOINT}${id}/`, data);
  },

  /**
   * Partially update a section
   * PATCH /api/sections/{id}/
   * 
   * @param id - Section ID
   * @param data - Partial section data to update
   * @returns Updated section
   */
  partialUpdate: (id: number | string, data: UpdateSectionInput) => {
    return apiClient.patch<Section>(`${SECTIONS_ENDPOINT}${id}/`, data);
  },

  /**
   * Delete a section
   * DELETE /api/sections/{id}/
   * 
   * @param id - Section ID
   * @returns Empty response on success
   */
  delete: (id: number | string) => {
    return apiClient.delete<void>(`${SECTIONS_ENDPOINT}${id}/`);
  },

  /**
   * Get section statistics
   * GET /api/sections/statistics/
   * 
   * @returns Aggregate statistics about sections
   */
  getStatistics: () => {
    return apiClient.get<SectionStatistics>(`${SECTIONS_ENDPOINT}statistics/`);
  },

  /**
   * Get section summary with additional details
   * GET /api/sections/{id}/summary/
   * 
   * @param id - Section ID
   * @returns Detailed summary of the section
   */
  getSummary: (id: number | string) => {
    return apiClient.get<SectionSummary>(`${SECTIONS_ENDPOINT}${id}/summary/`);
  },
};
