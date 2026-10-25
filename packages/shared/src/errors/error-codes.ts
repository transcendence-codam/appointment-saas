// api error codes shared on backend and frontend
export const ErrorCode = {
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  STAFF_NOT_ASSIGNED: 'STAFF_NOT_ASSIGNED',
  SLOT_UNAVAILABLE: 'SLOT_UNAVAILABLE',
  SLOT_TAKEN: 'SLOT_TAKEN',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  CHANGE_CUTOFF_PASSED: 'CHANGE_CUTOFF_PASSED',
  APPOINTMENT_CHANGED: 'APPOINTMENT_CHANGED',
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
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  INVALID_STATUS_TRANSITION: 'Following transition is not allowed on this appointment',
  CHANGE_CUTOFF_PASSED: 'It is not possible anymore to change this appointment',
  APPOINTMENT_CHANGED: 'Appointment was just changed by someone else, please reload',
};
