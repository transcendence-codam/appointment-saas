// unified error shape for every endpoint
export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ApiError>;

  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}
