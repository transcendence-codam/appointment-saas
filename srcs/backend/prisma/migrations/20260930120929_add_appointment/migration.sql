/*
  Warnings:

  - The values [created,rescheduled] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `service_name_snapshot` on the `Appointment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Event" AS ENUM ('created', 'rescheduled', 'cancelled', 'completed', 'noshow');

-- CreateEnum
CREATE TYPE "Actor" AS ENUM ('staff', 'client', 'system');

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('booked', 'confirmed', 'cancelled', 'completed', 'noshow', 'history');
ALTER TABLE "public"."Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'booked';
COMMIT;

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "service_name_snapshot",
ADD COLUMN     "priceCentsSnapshot" INTEGER,
ADD COLUMN     "serviceNameSnapshot" VARCHAR(510),
ALTER COLUMN "status" SET DEFAULT 'booked';

-- CreateTable
CREATE TABLE "AppointmentEvent" (
    "id" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "type" "Event" NOT NULL DEFAULT 'created',
    "actor" "Actor" NOT NULL,
    "actorUserId" UUID NOT NULL,
    "oldStartsAt" TIMESTAMP(3),
    "newStartsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AppointmentEvent" ADD CONSTRAINT "AppointmentEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
