// here i mock some methods that are not part of my work scope and are not ready yet
// when they are ready they will be substituted with real implementations

import { Prisma } from '../generated/prisma/client.js';

export async function isSlotFree(
  tenantId: string,
  serviceId: string,
  staffId: string,
  startsAt: string,
  tx: Prisma.TransactionClient,
): Promise<boolean> {
  void tenantId;
  void serviceId;
  void staffId;
  void startsAt;
  void tx;
  return await true;
}

export async function isStaffAssigned(
  staffId: string,
  serviceId: string,
  tx: Prisma.TransactionClient,
): Promise<boolean> {
  void staffId;
  void serviceId;
  void tx;
  return await true;
}

// mock token issue, real version will store a hashed token in the db
export async function issueToken(
  apptId: string,
  tx: Prisma.TransactionClient,
): Promise<{ token: string; url: string }> {
  void tx;
  return await { token: apptId, url: `http://localhost:3000/${apptId}` };
}
