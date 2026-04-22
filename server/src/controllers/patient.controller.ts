import { Request, Response } from "express"
import { createPasswordSetupToken } from "../services/auth.service"
import * as patientService from "../services/patient.service"
import { CreatePatientInput, PortalAccessInput, UpdatePatientInput } from "../types/patient.types"
import { sendPatientPortalAccessEmail } from "../utils/mailer"

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const professionalId = req.user!.id
    const patients = await patientService.getAllPatients(professionalId)
    res.status(200).json({ patients })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los pacientes" })
  }
}

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id
    const patient = await patientService.getPatientById(id, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    res.status(200).json({ patient })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el paciente" })
  }
}

export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      age,
      email,
      phone,
      diagnosis,
      generalObjective,
      contentHierarchy,
      hierarchyCriteria,
      focus,
      modality,
      strategies
    }: CreatePatientInput = req.body
    const professionalId = req.user!.id

    if (!name) {
      res.status(400).json({ message: "El nombre es requerido" })
      return
    }

    const patient = await patientService.createPatient(
      {
        name,
        age,
        email,
        phone,
        diagnosis,
        generalObjective: generalObjective?.trim() || "",
        contentHierarchy: (contentHierarchy ?? []).map((item) => item.trim()).filter(Boolean),
        hierarchyCriteria: hierarchyCriteria?.trim() || "",
        focus: focus?.trim() || "",
        modality: modality?.trim() || "",
        strategies: strategies?.trim() || ""
      },
      professionalId
    )
    res.status(201).json({ patient })
  } catch (error) {
    res.status(500).json({ message: "Error al crear el paciente" })
  }
}

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const data: UpdatePatientInput = req.body
    const professionalId = req.user!.id

    const existing = await patientService.getPatientById(id, professionalId)

    if (!existing) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const patient = await patientService.updatePatient(id, {
      ...data,
      generalObjective: data.generalObjective !== undefined ? data.generalObjective.trim() : undefined,
      contentHierarchy: data.contentHierarchy !== undefined
        ? data.contentHierarchy.map((item) => item.trim()).filter(Boolean)
        : undefined,
      hierarchyCriteria: data.hierarchyCriteria !== undefined ? data.hierarchyCriteria.trim() : undefined,
      focus: data.focus !== undefined ? data.focus.trim() : undefined,
      modality: data.modality !== undefined ? data.modality.trim() : undefined,
      strategies: data.strategies !== undefined ? data.strategies.trim() : undefined
    })
    res.status(200).json({ patient })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el paciente" })
  }
}

export const configurePortalAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id
    const { email, password }: PortalAccessInput = req.body

    if (!email || !password) {
      res.status(400).json({ message: "Email y contraseña son requeridos" })
      return
    }

    const existing = await patientService.getPatientById(id, professionalId)

    if (!existing) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const user = await patientService.configurePortalAccess(id, existing.name, { email, password })
    const { token, expiresAt } = await createPasswordSetupToken(user.id)
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173"
    const passwordSetupUrl = `${frontendBaseUrl}/portal/set-password?token=${encodeURIComponent(token)}`

    void sendPatientPortalAccessEmail(
      user.email,
      existing.name,
      password,
      passwordSetupUrl,
      expiresAt
    ).catch((err) => {
      console.error("Error enviando correo de acceso al portal:", err)
    })

    res.status(200).json({
      user,
      message: "Acceso al portal guardado correctamente. El correo se está procesando."
    })
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(400).json({ message: "Ya existe un usuario con ese email" })
      return
    }

    res.status(500).json({ message: "Error al configurar el acceso al portal" })
  }
}

export const deactivatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id

    const existing = await patientService.getPatientById(id, professionalId)

    if (!existing) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    await patientService.deactivatePatient(id)
    res.status(200).json({ message: "Paciente desactivado correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al desactivar el paciente" })
  }
}
