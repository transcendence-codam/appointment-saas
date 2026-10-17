import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().max(50).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
