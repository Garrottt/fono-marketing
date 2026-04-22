-- AlterTable
ALTER TABLE "OperationalGoal" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'no_cumplido';
