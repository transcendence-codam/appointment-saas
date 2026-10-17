import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessage, type ApiError, type ErrorCode } from '@appointment-saas/shared';

export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    code: ErrorCode,
    message = ErrorMessage[code],
    details?: unknown,
  ) {
    super({ code, message, details } satisfies ApiError, status);
  }
}
