import { Prisma } from '../generated/prisma/client.js';

// extract postgres error code from prisma error
export function pgErrorCode(error: unknown): string | undefined {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return undefined;
  }
  const meta = error.meta as { driverAdapterError?: { cause?: { originalCode?: string } } } | undefined;

  return meta?.driverAdapterError?.cause?.originalCode;
}
