import type { SchemaObject } from '@nestjs/swagger';
import type { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ErrorCode } from '@appointment-saas/shared';

export function zodSchema(schema: ZodTypeAny): SchemaObject {
  return zodToJsonSchema(schema, { target: 'openApi3', $refStrategy: 'none' }) as SchemaObject;
}

export function apiErrorSchema(...codes: ErrorCode[]): SchemaObject {
  return {
    type: 'object',
    required: ['code', 'message'],
    properties: {
      code: codes.length ? { type: 'string', enum: codes } : { type: 'string' },
      message: { type: 'string' },
      details: {},
    },
  };
}
