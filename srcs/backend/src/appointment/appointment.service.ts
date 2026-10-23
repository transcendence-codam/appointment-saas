import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ErrorCode,
  type CreateAppointmentInput,
  type CreateAppointmentResponse,
} from '@appointment-saas/shared';
import {
  Actor,
  AppointmentEventType,
  AppointmentStatus,
  Prisma,
  type Appointment,
} from '../generated/prisma/client.js';
import { ApiException } from '../common/api-exception.js';
import { pgErrorCode } from '../common/prisma-errors.js';
import { isSlotFree, isStaffAssigned, issueToken } from './mock.js';
import { ClientService } from '../client/client.service.js';
import { randomInt } from 'crypto';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientService: ClientService,
  ) {}

  /*steps to create an appointment:
1. find tennat by its slug, receive tenantId
2. check that service exists for current tenant (here receive service duration), that service is active
3. check that the staff can perform a service (isStaffAssigned function) , that staff is active
4. check there is a slot with enough duration for this staff to perform a service (isSlotFree)
5. create or update client
    (client is identified by tenantid+email, if email already exists with current tenant just update name+phone)
6. when all validated create an appointment (can fail because of no-double-booking constraint) with pending or comfirmed
7. create appointment_event entry (appointmen was created by client here)
8. create magic link and url to manage appointment
10. emit bookig_created event to send email to client about booking with reference id
9. return appointment booked successfuly response to the user (with id, reference code, start_at, end_at) */
  async bookAppointment(
    slug: string,
    body: CreateAppointmentInput,
  ): Promise<CreateAppointmentResponse> {
    return this.prisma.$transaction(async (tx) => {
      const { serviceId, staffId, startsAt } = body;

      const tenant = await tx.tenant.findUnique({ where: { slug } });
      if (!tenant) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          ErrorCode.TENANT_NOT_FOUND,
          `Tenant "${slug}" not found`,
        );
      }

      const service = await tx.service.findFirst({ where: { id: serviceId, tenantId: tenant.id } });
      if (!service || !service.isActive) {
        // TODO separate errors, move to servicesService?
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          ErrorCode.SERVICE_NOT_FOUND,
          `Service "${serviceId}"`,
        );
      }

      const assigned = await isStaffAssigned(staffId, serviceId, tx);
      if (!assigned) {
        // chec staff exist, separate errot
        throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.STAFF_NOT_ASSIGNED);
      }

      const free = await isSlotFree(tenant.id, serviceId, staffId, startsAt, tx);
      if (!free) {
        throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.SLOT_UNAVAILABLE);
      }

      const client = await this.clientService.upsertForBooking(tenant.id, body.client, tx);

      const start = new Date(startsAt); // TODO check boundaries (past, horizon)
      const appt = await this.createAppointment(
        {
          tenantId: tenant.id,
          clientId: client.id,
          serviceId,
          staffId,
          startsAt: start,
          endsAt: new Date(start.getTime() + service.durationMin * 60_000),
          status: AppointmentStatus.pending, // or auto-confirmed?
          reference: this.generateRandomReferenceCode(),
          serviceNameSnapshot: service.name,
          priceCentsSnapshot: service.priceCents,
        },
        tx,
      );
      // log event (move to createAppointment?)
      await tx.appointmentEvent.create({
        data: {
          appointmentId: appt.id,
          type: AppointmentEventType.created,
          actor: Actor.client,
          actorId: client.id,
        },
      });

      // issue token to manage appoinment and receive url
      // emit event AppointmentCreated to send email to client

      return {
        appointmentId: appt.id,
        reference: appt.reference,
        startsAt: appt.startsAt.toISOString(),
        endsAt: appt.endsAt.toISOString(),
      };
    });
  }

  // extra wrapped appointment creation to check for appointment_no_overlap constraint
  // to prevent race condition when another client book the slot after isSlotFree passed
  private async createAppointment(
    data: Prisma.AppointmentUncheckedCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<Appointment> {
    try {
      return await tx.appointment.create({ data });
    } catch (e) {
      if (pgErrorCode(e) === '23P01') {
        throw new ApiException(HttpStatus.CONFLICT, ErrorCode.SLOT_TAKEN);
      }

      throw e;
    }
  }

  // 36^8 ≈ 2.8 trillion combinations
  private generateRandomReferenceCode(length: number = 8): string {
    const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let code = '';
    for (let i = 0; i < length; i++) {
      code += CHARS[randomInt(CHARS.length)];
    }

    return code;
  }
}
