-- AlterTable
ALTER TABLE "File"
ADD COLUMN "sessionTaskId" TEXT;

-- AddForeignKey
ALTER TABLE "File"
ADD CONSTRAINT "File_sessionTaskId_fkey" FOREIGN KEY ("sessionTaskId") REFERENCES "SessionTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
