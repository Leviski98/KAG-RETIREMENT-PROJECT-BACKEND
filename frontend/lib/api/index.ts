/**
 * API Client Exports
 * 
 * Central export point for all API clients.
 * Import API clients from this file for consistency.
 */

// Base client
export { apiClient, API_BASE_URL, ApiRequestError } from '@/lib/api/client';
export type { PaginatedResponse, ApiError } from '@/lib/api/client';

// District API
export { districtApi, getAllDistricts, getDistrictById, createDistrict, updateDistrict, partialUpdateDistrict, deleteDistrict, getDistrictStatistics, getDistrictSummary, bulkCreateDistricts } from '@/lib/api/district';

// Section API
export { sectionApi } from '@/lib/api/section';

// Pastor API
export { pastorApi } from '@/lib/api/pastor';
