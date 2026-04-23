import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JwtPayload } from "../types/auth.types"

// Extendemos el tipo Request de Express para agregarle el campo "user"
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 1. Obtenemos el header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Token no proporcionado" })
      return
    }

    // 2. Extrae el token 
    const token = authHeader.split(" ")[1]

    // 3. Verificar el token con la clave secreta
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    // 4. Adjuntar los datos del usuario al request para usarlos en el controller
    req.user = payload

    // 5. Dejar pasar el request
    next()

  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" })
  }
}

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "PROFESSIONAL") {
    res.status(403).json({ message: "No tienes permisos para realizar esta acción" })
    return
  }
  next()
}

export const authorizePatientOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.user?.role

  if (role !== "PROFESSIONAL" && role !== "PATIENT") {
    res.status(403).json({ message: "No tenés permisos para realizar esta acción" })
    return
  }

  next()
}

export const authorizeCron = (req: Request, res: Response, next: NextFunction): void => {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    res.status(500).json({ message: "CRON_SECRET no configurado" })
    return
  }

  const authHeader = req.headers.authorization

  if (authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ message: "No autorizado" })
    return
  }

  next()
}
