import { Request, Response } from "express"
import * as fileService from "../services/file.service"
import * as patientService from "../services/patient.service"
import fs from "fs"
import { buildUploadUrl, getUploadPathFromUrl } from "../utils/uploads"

export const getFilesByPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const professionalId = req.user!.id

    const patient = await patientService.getPatientById(patientId, professionalId)
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const files = await fileService.getFilesByPatient(patientId)
    res.status(200).json({ files })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los archivos" })
  }
}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const professionalId = req.user!.id

    const patient = await patientService.getPatientById(patientId, professionalId)
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    if (!req.file) {
      res.status(400).json({ message: "No se recibió ningún archivo" })
      return
    }

    const file = await fileService.createFile(
      patientId,
      professionalId,
      req.file.originalname,
      buildUploadUrl(req.file.filename),
      req.file.mimetype
    )

    res.status(201).json({ file })
  } catch (error) {
    res.status(500).json({ message: "Error al subir el archivo" })
  }
}

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id

    const existing = await fileService.getFileById(id)

    if (!existing || existing.professionalId !== professionalId) {
      res.status(404).json({ message: "Archivo no encontrado" })
      return
    }

    // Eliminar el archivo físico del servidor
    const filePath = getUploadPathFromUrl(existing.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await fileService.deleteFile(id)
    res.status(200).json({ message: "Archivo eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el archivo" })
  }
}
