import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  isActionAllowed,
  ErrorCode,
  type AppointmentAction,
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
  ) { }

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

  /* 
  steps to cancel appointment:
  1. find appointment exists within current tenant
  2. check that appointment can be cancelled, that the transition of status allowed 
      if cancelled by staff, then change needs to be performed before appointment starts
      if cancelled by client, need to respect tenant cutoff hours
  3. change status to cancelled with extra checks
      check appointment did not change since it was read by findAppoinment
      wrap no-overlap constraint
  4. create appointmentEvent
  5. TODO emit event to send email to client
  5. return updated appointemnt to frontend */
  async cancelAppointment({ id, tenantId, actor, actorId, reason }:
    { id: string; tenantId: string; actor: Actor; actorId?: string; reason?: string; }): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      const appt = await this.findAppointment(id, tenantId, tx);
      await this.validateChange(appt, 'cancel', actor, tx);

      const updated = await this.updateIfUnchanged(
        appt,
        { status: AppointmentStatus.cancelled },
        tx,
      );

      await tx.appointmentEvent.create({
        data: {
          appointmentId: appt.id,
          type: AppointmentEventType.cancelled,
          actor,
          actorId,
          reason,
        },
      });

      // emit event AppointmentCancelled to send email to client
      return updated;
    });
  }

  /* steps to reschedule appointment
  1. find that appointment exists under current tenant
  2. determine what status to give to rescheduled appointment
      either pending or confirmed (if auto-confirmed is on)
      if changed by staff appointment keeps the same status (or confirmed???)
      if changed by client need to decide (if auto confirm on then confirm? otherwise pending?)
  3. validate if status change allowed, if cutoff hours respected by client 
  4. check new slot is within allowed horizon
  5. check new slot is free
  6. update current appointment with new status and time
  7. create appointmentEvent with status transation
  8. send email appoitnmentRescheduled for event emitter
  9. return updated event to client */
  async rescheduleAppointment({ id, tenantId, actor, actorId, newStartsAt }:
    { id: string; tenantId: string; actor: Actor; actorId?: string; newStartsAt: Date; }): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      const appt = await this.findAppointment(id, tenantId, tx);

      await this.validateChange(appt, 'reschedule', actor, tx);
      const status = actor === Actor.client ? AppointmentStatus.pending : appt.status;

      if (newStartsAt.getTime() <= Date.now()) { // TODO max horizon from tenant settings for new slot
        throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.SLOT_UNAVAILABLE);
      }

      const free = await isSlotFree(
        tenantId,
        appt.serviceId,
        appt.staffId,
        newStartsAt.toISOString(),
        tx,
      );
      if (!free) {
        throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.SLOT_UNAVAILABLE);
      }

      const apptDuration = appt.endsAt.getTime() - appt.startsAt.getTime(); // or check again using serviceID if duration changed for the?
      const updated = await this.updateIfUnchanged(
        appt,
        {
          status,
          startsAt: newStartsAt,
          endsAt: new Date(newStartsAt.getTime() + apptDuration)
        },
        tx,
      );

      await tx.appointmentEvent.create({
        data: {
          appointmentId: appt.id,
          type: AppointmentEventType.rescheduled,
          actor,
          actorId,
          oldStartsAt: appt.startsAt,
          newStartsAt,
        },
      });

      // emit event AppointmentRescheduled to send email to client
      return updated;
    });
  }

  private async findAppointment(id: string, tenantId: string, tx: Prisma.TransactionClient)
    : Promise<Appointment> {
    const appt = await tx.appointment.findFirst({ where: { id, tenantId } });
    if (!appt) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.APPOINTMENT_NOT_FOUND);
    }

    return appt;
  }

  private async validateChange(appt: Appointment, action: AppointmentAction, actor: Actor, tx: Prisma.TransactionClient): Promise<void> {
    if (!isActionAllowed(action, appt.status, actor)) {
      throw new ApiException(HttpStatus.CONFLICT, ErrorCode.INVALID_STATUS_TRANSITION);
    }

    // if actor is staff they cannot change after appoitment started
    const msUntilStart = appt.startsAt.getTime() - Date.now();
    if (msUntilStart <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.CHANGE_CUTOFF_PASSED);
    }

    // if actor is client they have extra validation of cutoff hours
    if (actor === Actor.client) {
      // TODO use tenantService here
      const settings = await tx.tenantSettings.findUnique({ where: { tenantId: appt.tenantId } });
      const cutoffMs = (settings?.cancelCutoffHours ?? 0) * 3_600_000;

      if (msUntilStart < cutoffMs) {
        throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.CHANGE_CUTOFF_PASSED);
      }
    }
  }

  // optimistic locking guard for every change to appointment table, any change will increment version by 1
  // in this case updateMany will return 0 because no row with such version exists anymore
  // that means someone else chnaged appointment since it was read so all operation needs to be re-done again
  private async updateIfUnchanged(
    appt: Appointment,
    data: Prisma.AppointmentUncheckedUpdateManyInput,
    tx: Prisma.TransactionClient,
  ): Promise<Appointment> {
    try {
      const { count } = await tx.appointment.updateMany({
        where: { id: appt.id, tenantId: appt.tenantId, version: appt.version },
        data: { ...data, version: { increment: 1 } },
      });
      if (count === 0) {
        throw new ApiException(HttpStatus.CONFLICT, ErrorCode.APPOINTMENT_CHANGED);
      }
    } catch (e) {
      if (pgErrorCode(e) === '23P01') {
        throw new ApiException(HttpStatus.CONFLICT, ErrorCode.SLOT_TAKEN);
      }

      throw e;
    }

    return tx.appointment.findUniqueOrThrow({ where: { id: appt.id } });
  }
}
