import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { isApiError, type ApiError } from '@appointment-saas/shared';

// turns every HttpException into the shared ApiError shape
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    const body: ApiError = isApiError(payload)
      ? payload
      : {
        code: HttpStatus[status] ?? 'HTTP_ERROR',
        message: exception.message,
        details: typeof payload === 'object' ? payload : undefined,
      };

    response.status(status).json(body);
  }
}
