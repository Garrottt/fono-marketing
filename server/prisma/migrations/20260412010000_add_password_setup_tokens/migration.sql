CREATE TABLE "PasswordSetupToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordSetupToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordSetupToken_jti_key" ON "PasswordSetupToken"("jti");

ALTER TABLE "PasswordSetupToken"
ADD CONSTRAINT "PasswordSetupToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
