/*
  Warnings:

  - A unique constraint covering the columns `[id,tenant_id]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[membership_id,tenant_id]` on the table `staff` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "membership_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "memberships_id_tenant_id_key" ON "memberships"("id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_membership_id_tenant_id_key" ON "staff"("membership_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_membership_id_tenant_id_fkey" FOREIGN KEY ("membership_id", "tenant_id") REFERENCES "memberships"("id", "tenant_id") ON DELETE NO ACTION ON UPDATE CASCADE;
