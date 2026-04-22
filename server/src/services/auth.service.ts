import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { randomUUID } from "crypto"
import prisma from "../lib/prisma"
import { PasswordSetupTokenPayload } from "../types/auth.types"

const PASSWORD_SETUP_HOURS = 24

const getPasswordSetupExpiry = () => {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + PASSWORD_SETUP_HOURS)
  return expiresAt
}

export const createPasswordSetupToken = async (userId: string) => {
  const jti = randomUUID()
  const expiresAt = getPasswordSetupExpiry()

  await prisma.passwordSetupToken.updateMany({
    where: {
      userId,
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  })

  await prisma.passwordSetupToken.create({
    data: {
      userId,
      jti,
      expiresAt
    }
  })

  const payload: PasswordSetupTokenPayload = {
    userId,
    purpose: "password_setup",
    jti
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: `${PASSWORD_SETUP_HOURS}h`
  })

  return {
    token,
    expiresAt
  }
}

export const validatePasswordSetupToken = async (token: string) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET as string) as PasswordSetupTokenPayload

  if (payload.purpose !== "password_setup") {
    throw new Error("INVALID_PURPOSE")
  }

  const setupToken = await prisma.passwordSetupToken.findUnique({
    where: { jti: payload.jti },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  })

  if (!setupToken || setupToken.userId !== payload.userId) {
    throw new Error("TOKEN_NOT_FOUND")
  }

  if (setupToken.usedAt) {
    throw new Error("TOKEN_USED")
  }

  if (setupToken.expiresAt < new Date()) {
    throw new Error("TOKEN_EXPIRED")
  }

  return setupToken
}

export const completePasswordSetup = async (token: string, newPassword: string) => {
  const setupToken = await validatePasswordSetupToken(token)
  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: setupToken.userId },
      data: { passwordHash }
    }),
    prisma.passwordSetupToken.update({
      where: { id: setupToken.id },
      data: { usedAt: new Date() }
    })
  ])

  return setupToken.user
}
