// api error codes shared on backend and frontend
export const ErrorCode = {
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  STAFF_NOT_ASSIGNED: 'STAFF_NOT_ASSIGNED',
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  SLOT_TAKEN: 'SLOT_TAKEN',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// user friendly messages for each error code
export const ErrorMessage: Record<ErrorCode, string> = {
  TENANT_NOT_FOUND: 'Business not found',
  SERVICE_NOT_FOUND: 'Service not found or not available',
  STAFF_NOT_ASSIGNED: 'Selected staff member does not provide this service',
  SLOT_UNAVAILABLE: 'Selected time is not available',
  SLOT_TAKEN: 'Selected time was just booked by someone else',
  VALIDATION_FAILED: 'Request data is invalid',
};
