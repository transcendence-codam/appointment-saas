-- CreateTable
CREATE TABLE "magic_link_token" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "appointment_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "magic_link_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_token_token_hash_key" ON "magic_link_token"("token_hash");

-- CreateIndex
CREATE INDEX "magic_link_token_appointment_id_idx" ON "magic_link_token"("appointment_id");

-- CreateIndex
CREATE INDEX "magic_link_token_expires_at_idx" ON "magic_link_token"("expires_at");

-- AddForeignKey
ALTER TABLE "magic_link_token" ADD CONSTRAINT "magic_link_token_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
