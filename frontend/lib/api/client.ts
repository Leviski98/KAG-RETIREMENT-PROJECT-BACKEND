/**
 * Base API Client
 *
 * Provides common utilities for making API requests to the Django backend.
 * Includes error handling, response parsing, and request configuration.
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Common types for API responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: string;
  detail?: string;
  [key: string]: string | undefined;
}

// Request configuration
interface RequestConfig extends RequestInit {
  params?: object;
}

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Record<string, string | number | boolean> | string
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: object): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Parse API response
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      throw new ApiRequestError(
        data.error || data.detail || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  }

  if (!response.ok) {
    throw new ApiRequestError(
      `Request failed with status ${response.status}`,
      response.status
    );
  }

  // For non-JSON responses, return text as T
  // This is intentional for flexibility with different response types
  const text = await response.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return text as any as T;
}

/**
 * Generic request handler
 */
async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...fetchConfig } = config;

  const url = buildUrl(endpoint, params);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const mergedConfig: RequestInit = {
    ...fetchConfig,
    headers: {
      ...defaultHeaders,
      ...fetchConfig.headers,
    },
  };

  try {
    const response = await fetch(url, mergedConfig);
    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Network or other errors
    throw new ApiRequestError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

/**
 * HTTP Methods
 */
export const apiClient = {
  get: <T>(endpoint: string, params?: object) =>
    request<T>(endpoint, { method: 'GET', params }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T>(endpoint: string, data?: any, params?: object) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      params,
    }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T>(endpoint: string, data?: any, params?: object) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      params,
    }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T>(endpoint: string, data?: any, params?: object) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      params,
    }),

  delete: <T>(endpoint: string, params?: object) =>
    request<T>(endpoint, { method: 'DELETE', params }),
};

/**
 * Export base URL for reference
 */
export { API_BASE_URL };
