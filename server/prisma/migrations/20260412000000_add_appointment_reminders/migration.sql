CREATE TABLE "AppointmentReminder" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppointmentReminder_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AppointmentReminder"
ADD CONSTRAINT "AppointmentReminder_appointmentId_fkey"
FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "AppointmentReminder" ("id", "appointmentId", "scheduledAt", "sentAt", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    "id",
    "reminderScheduledAt",
    CASE WHEN "reminderSent" = true THEN NOW() ELSE NULL END,
    NOW(),
    NOW()
FROM "Appointment"
WHERE "reminderScheduledAt" IS NOT NULL;
