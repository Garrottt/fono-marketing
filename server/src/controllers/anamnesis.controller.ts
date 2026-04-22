import { Request, Response } from "express"
import * as anamnesisService from "../services/anamnesis.service"
import * as patientService from "../services/patient.service"
import { UpdateAnamnesisInput } from "../types/anamnesis.types"

export const getAnamnesisByPatientId = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string
    const professionalId = req.user!.id
    const patient = await patientService.getPatientById(patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const anamnesis = await anamnesisService.getAnamnesisByPatientId(patientId)
    res.status(200).json({ anamnesis })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la anamnesis" })
  }
}

export const upsertAnamnesis = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id as string
    const professionalId = req.user!.id
    const patient = await patientService.getPatientById(patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const data: UpdateAnamnesisInput = req.body
    const anamnesis = await anamnesisService.upsertAnamnesis(patientId, data)

    res.status(200).json({
      anamnesis,
      message: "Anamnesis guardada correctamente"
    })
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la anamnesis" })
  }
}
