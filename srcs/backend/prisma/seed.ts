import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

const TENANT_SLUG = 'demo-salon';
const OWNER_EMAIL = 'owner@demo-salon.test';

async function reset() {
  await prisma.appointment.deleteMany({ where: { tenant: { slug: TENANT_SLUG } } });
  await prisma.tenant.deleteMany({ where: { slug: TENANT_SLUG } });
  await prisma.user.deleteMany({ where: { email: OWNER_EMAIL } });
}

async function main() {
  await reset();

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Salon',
      slug: TENANT_SLUG,
      settings: {
        create: {
          timezone: 'Europe/Amsterdam',
          currency: 'EUR',
          locale: 'en',
          cancelCutoffHours: 24,
          minNoticeHours: 2,
          maxHorizonDays: 30,
          reminderHoursBefore: 24,
        },
      },
    },
  });

  const user = await prisma.user.create({
    data: { email: OWNER_EMAIL, name: 'Olivia Owner', passwordHash: 'testhash' },
  });

  const membership = await prisma.membership.create({
    data: { tenantId: tenant.id, userId: user.id, role: 'owner' },
  });

  const staff = await prisma.staff.create({
    data: { tenantId: tenant.id, membershipId: membership.id, displayName: 'Olivia' },
  });

  const service = await prisma.service.create({
    data: { tenantId: tenant.id, name: 'Haircut', durationMin: 60, priceCents: 3500 },
  });

  await prisma.staffService.create({ data: { staffId: staff.id, serviceId: service.id } });

  const client = await prisma.client.create({
    data: { tenantId: tenant.id, email: 'email@example.com', name: 'Charlie Client' },
  });

  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);
  start.setUTCHours(10, 0, 0, 0);
  const at = (minutes: number) => new Date(start.getTime() + minutes * 60_000);

  const book = (reference: string, from: number, to: number, status: 'confirmed' | 'pending' = 'confirmed') =>
    prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        clientId: client.id,
        serviceId: service.id,
        staffId: staff.id,
        startsAt: at(from),
        endsAt: at(to),
        status,
        reference,
        serviceNameSnapshot: service.name,
        priceCentsSnapshot: service.priceCents,
      },
    });

  await book('DEMO-1', 0, 60);
  await book('DEMO-2', 60, 120);
  await book('DEMO-3', 60, 120, 'pending');
  await book('DEMO-4', 120, 180);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
