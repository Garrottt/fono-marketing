-- AlterTable
ALTER TABLE "Session"
ADD COLUMN     "sessionNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "contentHierarchy" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hierarchyCriteria" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "focus" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "modality" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "strategies" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "generalObjective" TEXT NOT NULL DEFAULT '';

WITH ranked_sessions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "patientId" ORDER BY date ASC, "createdAt" ASC) AS next_number
  FROM "Session"
)
UPDATE "Session"
SET "sessionNumber" = ranked_sessions.next_number
FROM ranked_sessions
WHERE "Session".id = ranked_sessions.id;

-- CreateTable
CREATE TABLE "SessionSpecificObjective" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionSpecificObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionOperationalObjective" (
    "id" TEXT NOT NULL,
    "specificObjectiveId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionOperationalObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTask" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_patientId_sessionNumber_key" ON "Session"("patientId", "sessionNumber");

-- AddForeignKey
ALTER TABLE "SessionSpecificObjective" ADD CONSTRAINT "SessionSpecificObjective_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionOperationalObjective" ADD CONSTRAINT "SessionOperationalObjective_specificObjectiveId_fkey" FOREIGN KEY ("specificObjectiveId") REFERENCES "SessionSpecificObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
