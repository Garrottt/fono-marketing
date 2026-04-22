-- AlterTable
ALTER TABLE "SessionOperationalObjective" ADD COLUMN     "activities" TEXT[] DEFAULT ARRAY[]::TEXT[];
