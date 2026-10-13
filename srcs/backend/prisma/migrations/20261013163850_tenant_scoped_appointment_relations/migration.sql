/*
  Warnings:

  - A unique constraint covering the columns `[id,tenant_id]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `staff` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_client_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_service_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_staff_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "clients_id_tenant_id_key" ON "clients"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_id_tenant_id_key" ON "services"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_id_tenant_id_key" ON "staff"("id", "tenant_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_tenant_id_fkey" FOREIGN KEY ("client_id", "tenant_id") REFERENCES "clients"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_tenant_id_fkey" FOREIGN KEY ("service_id", "tenant_id") REFERENCES "services"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_tenant_id_fkey" FOREIGN KEY ("staff_id", "tenant_id") REFERENCES "staff"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
