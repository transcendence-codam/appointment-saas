import { z } from 'zod';
import { clientSchema } from '../client/client.schema.js';

export const createAppoinmentSchema = z.object({
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startsAt: z.string().datetime(),
  client: clientSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppoinmentSchema>;

export const createAppointmentResponseSchema = z.object({
  appointmentId: z.string().uuid(),
  reference: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export type CreateAppointmentResponse = z.infer<typeof createAppointmentResponseSchema>;
