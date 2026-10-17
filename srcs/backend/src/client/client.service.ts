import { Injectable } from '@nestjs/common';
import type { Prisma, Client } from '../generated/prisma/client.js';
import type { ClientInput } from '@appointment-saas/shared';

@Injectable()
export class ClientService {
  // update or insert, client is unique by tenantId + email
  // if client not found they are created, if found - phone & name get updated (TODO think of snapshot on old bookings)
  async upsertForBooking(
    tenantId: string,
    entry: ClientInput,
    tx: Prisma.TransactionClient,
  ): Promise<Client> {
    return tx.client.upsert({
      where: { tenantId_email: { tenantId, email: entry.email } },
      update: { name: entry.name, phone: entry.phone },
      create: { tenantId, ...entry },
    });
  }
}
