CREATE TABLE "PreLavadoEvaluation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hasDiabetesOrImmunosuppression" BOOLEAN NOT NULL DEFAULT false,
    "hasPreviousEarSurgeries" BOOLEAN NOT NULL DEFAULT false,
    "hasKnownPerforation" BOOLEAN NOT NULL DEFAULT false,
    "otalgia" BOOLEAN NOT NULL DEFAULT false,
    "hipoacusia" BOOLEAN NOT NULL DEFAULT false,
    "plenitudOtica" BOOLEAN NOT NULL DEFAULT false,
    "otorrea" BOOLEAN NOT NULL DEFAULT false,
    "prurito" BOOLEAN NOT NULL DEFAULT false,
    "otorragia" BOOLEAN NOT NULL DEFAULT false,
    "usesHearingAid" BOOLEAN NOT NULL DEFAULT false,
    "hearingAidBadSmell" BOOLEAN NOT NULL DEFAULT false,
    "dolorAlTocarTrago" BOOLEAN NOT NULL DEFAULT false,
    "odPabellonEstado" TEXT NOT NULL,
    "oiPabellonEstado" TEXT NOT NULL,
    "odPabellonObservacion" TEXT NOT NULL,
    "oiPabellonObservacion" TEXT NOT NULL,
    "odCaeEstado" TEXT NOT NULL,
    "oiCaeEstado" TEXT NOT NULL,
    "odCaeObservacion" TEXT NOT NULL,
    "oiCaeObservacion" TEXT NOT NULL,
    "odMembranaEstado" TEXT NOT NULL,
    "oiMembranaEstado" TEXT NOT NULL,
    "odMembranaObservacion" TEXT NOT NULL,
    "oiMembranaObservacion" TEXT NOT NULL,
    "odSullivan" TEXT NOT NULL,
    "oiSullivan" TEXT NOT NULL,
    "odObservaciones" TEXT,
    "oiObservaciones" TEXT,
    "aptoParaLavado" BOOLEAN NOT NULL DEFAULT true,
    "criticalBlocks" JSONB NOT NULL,
    "precautionAlerts" JSONB NOT NULL,
    "diagnosticSummary" TEXT NOT NULL,
    "suggestedConduct" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PreLavadoEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PreLavadoEvaluation_patientId_key" ON "PreLavadoEvaluation"("patientId");

ALTER TABLE "PreLavadoEvaluation"
ADD CONSTRAINT "PreLavadoEvaluation_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
