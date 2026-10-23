import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodTypeAny, z } from 'zod';
import { ErrorCode } from '@appointment-saas/shared';
import { ApiException } from './api-exception.js';

// validates incoming data using provided zod schema
// returns the parsed value
@Injectable()
export class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
        undefined,
        result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    return result.data;
  }
}
