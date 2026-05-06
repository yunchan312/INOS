import type { ApiResponse, PaginatedResponse } from '@inos/types';

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function createErrorResponse(error: string): ApiResponse<null> {
  return { success: false, data: null, error };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return { success: true, data, total, page, limit };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
