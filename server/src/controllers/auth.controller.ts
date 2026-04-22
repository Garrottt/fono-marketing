import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma"
import {
  CompletePasswordSetupInput,
  LoginInput,
  JwtPayload,
  ValidatePasswordSetupInput
} from "../types/auth.types"
import {
  completePasswordSetup,
  validatePasswordSetupToken as validatePasswordSetupTokenService
} from "../services/auth.service"

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body

    if (!email || !password) {
      res.status(400).json({ message: "Email y contraseña son requeridos" })
      return
    }

    // Buscar primero en Professional
    const professional = await prisma.professional.findUnique({
      where: { email }
    })

    if (professional) {
      const isPasswordValid = await bcrypt.compare(password, professional.passwordHash)
      if (!isPasswordValid) {
        res.status(401).json({ message: "Credenciales inválidas" })
        return
      }

      const payload: JwtPayload = {
        id: professional.id,
        email: professional.email,
        role: professional.role
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "8h" })

      res.status(200).json({
        token,
        user: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          role: professional.role
        }
      })
      return
    }

    // Si no es profesional, buscar en User (pacientes)
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      res.status(401).json({ message: "Credenciales inválidas" })
      return
    }

    const payload: JwtPayload = {
      id: user.patientId ?? user.id,
      email: user.email,
      role: user.role
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "8h" })

    res.status(200).json({
      token,
      user: {
        id: user.patientId ?? user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const me = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ user: req.user })
}

const getPasswordSetupErrorMessage = (error: unknown) => {
  const code = error instanceof Error ? error.message : ""

  if (code === "TokenExpiredError" || code === "TOKEN_EXPIRED") {
    return { status: 400, message: "El enlace expiró" }
  }

  if (code === "TOKEN_USED") {
    return { status: 400, message: "El enlace ya fue utilizado" }
  }

  return { status: 400, message: "El enlace no es válido" }
}

export const validatePasswordSetupToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token }: ValidatePasswordSetupInput = req.body

    if (!token) {
      res.status(400).json({ message: "El token es requerido" })
      return
    }

    const setupToken = await validatePasswordSetupTokenService(token)
    res.status(200).json({
      valid: true,
      user: setupToken.user
    })
  } catch (error) {
    const formatted = getPasswordSetupErrorMessage(error)
    res.status(formatted.status).json({ message: formatted.message, valid: false })
  }
}

export const completePasswordSetupController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword }: CompletePasswordSetupInput = req.body

    if (!token || !newPassword) {
      res.status(400).json({ message: "Token y nueva contraseña son requeridos" })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres" })
      return
    }

    await completePasswordSetup(token, newPassword)
    res.status(200).json({ message: "Contraseña actualizada correctamente" })
  } catch (error) {
    const formatted = getPasswordSetupErrorMessage(error)
    res.status(formatted.status).json({ message: formatted.message })
  }
}
