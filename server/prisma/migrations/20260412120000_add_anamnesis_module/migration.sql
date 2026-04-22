CREATE TABLE "Anamnesis" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "consultationReason" TEXT,
    "previousAudiologicalDiagnosis" TEXT,
    "lastAuditoryReview" TEXT,
    "hasDiabetesOrImmunosuppression" BOOLEAN NOT NULL DEFAULT false,
    "hasPreviousEarSurgeries" BOOLEAN NOT NULL DEFAULT false,
    "timpanoplastia" BOOLEAN NOT NULL DEFAULT false,
    "mastoidectomia" BOOLEAN NOT NULL DEFAULT false,
    "miringoplastia" BOOLEAN NOT NULL DEFAULT false,
    "osiculoplastia" BOOLEAN NOT NULL DEFAULT false,
    "estapedectomiaEstapedotomia" BOOLEAN NOT NULL DEFAULT false,
    "usesCambuchos" BOOLEAN NOT NULL DEFAULT false,
    "usesHearingAid" BOOLEAN NOT NULL DEFAULT false,
    "hearingAidFeelsLooserOrAnnoying" BOOLEAN NOT NULL DEFAULT false,
    "hearingAidSoundsLowerOrWhistles" BOOLEAN NOT NULL DEFAULT false,
    "hearingAidSuppurationOrBadSmell" BOOLEAN NOT NULL DEFAULT false,
    "hearingAidHoursPerDay" TEXT,
    "cleansWithCottonSwabsOrObjects" BOOLEAN NOT NULL DEFAULT false,
    "cleaningObjects" TEXT,
    "otalgia" BOOLEAN NOT NULL DEFAULT false,
    "prurito" BOOLEAN NOT NULL DEFAULT false,
    "hipoacusia" BOOLEAN NOT NULL DEFAULT false,
    "otorrea" BOOLEAN NOT NULL DEFAULT false,
    "otorragia" BOOLEAN NOT NULL DEFAULT false,
    "plenitudOtica" BOOLEAN NOT NULL DEFAULT false,
    "tinnitus" BOOLEAN NOT NULL DEFAULT false,
    "vertigoInestabilidad" BOOLEAN NOT NULL DEFAULT false,
    "autofonia" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Anamnesis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Anamnesis_patientId_key" ON "Anamnesis"("patientId");

ALTER TABLE "Anamnesis"
ADD CONSTRAINT "Anamnesis_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
