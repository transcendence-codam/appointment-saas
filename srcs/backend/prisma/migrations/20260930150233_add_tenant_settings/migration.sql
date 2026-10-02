-- CreateTable
CREATE TABLE "tenant_settings" (
    "tenant_id" UUID NOT NULL,
    "timezone" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "locale" TEXT NOT NULL,
    "cancel_cutoff_hours" INTEGER NOT NULL,
    "min_notice_hours" INTEGER NOT NULL,
    "max_horizon_days" INTEGER NOT NULL,
    "reminder_hours_before" INTEGER NOT NULL,
    "auto_confirm" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("tenant_id")
);

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
