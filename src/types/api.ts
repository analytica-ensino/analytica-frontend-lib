/**
 * Base API Client interface
 * Generic interface for HTTP client that can be used across all hooks
 * Compatible with Axios, fetch wrappers, and other HTTP clients
 */
export interface BaseApiClient {
  get: <T>(
    url: string,
    config?: { params?: Record<string, unknown> }
  ) => Promise<{ data: T }>;
  post: <T>(
    url: string,
    data?: Record<string, unknown>
  ) => Promise<{ data: T }>;
  patch: <T>(
    url: string,
    data?: Record<string, unknown>
  ) => Promise<{ data: T }>;
  delete: <T>(url: string) => Promise<{ data: T }>;
}

