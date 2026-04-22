import { Request, Response } from "express"
import fs from "fs"
import path from "path"
import * as fileService from "../services/file.service"
import * as taskService from "../services/task.service"
import * as patientService from "../services/patient.service"
import { CreateTaskInput } from "../types/task.types"



export const getTasksByPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const role = req.user!.role

    if (role === "PROFESSIONAL") {
      const patient = await patientService.getPatientById(patientId, req.user!.id)
      if (!patient) {
        res.status(404).json({ message: "Paciente no encontrado" })
        return
      }
    }

    const tasks = await taskService.getTasksByPatient(patientId)
    res.status(200).json({ tasks })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las tareas" })
  }
}

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const professionalId = req.user!.id
    const { title, description }: CreateTaskInput = req.body

    const patient = await patientService.getPatientById(patientId, professionalId)
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    if (!title) {
      res.status(400).json({ message: "El título es requerido" })
      return
    }

    const task = await taskService.createTask({ title, description }, patientId, professionalId)

    if (req.file) {
      await fileService.createFile(
        patientId,
        professionalId,
        req.file.originalname,
        `/uploads/${req.file.filename}`,
        req.file.mimetype,
        task.id
      )
    }

    const taskWithFile = await taskService.getTaskById(task.id)
    res.status(201).json({ task: taskWithFile })
  } catch (error) {
    res.status(500).json({ message: "Error al crear la tarea" })
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string

    await taskService.deleteTask(id)
    res.status(200).json({ message: "Tarea eliminada correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la tarea" })
  }
}
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id
    const { title, description } = req.body

    const existing = await taskService.getTaskById(id)
    if (!existing || existing.professionalId !== professionalId) {
      res.status(404).json({ message: "Tarea no encontrada" })
      return
    }

    // Si viene un archivo nuevo, eliminar el anterior y crear el nuevo
    if (req.file) {
      if (existing.files && existing.files.length > 0) {
        const oldFile = existing.files[0]
        const filePath = path.join(process.cwd(), oldFile.url)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        await fileService.deleteFile(oldFile.id)
      }

      await fileService.createFile(
        existing.patientId,
        professionalId,
        req.file.originalname,
        `/uploads/${req.file.filename}`,
        req.file.mimetype,
        id
      )
    }

    const task = await taskService.updateTask(id, { title, description })
    const taskWithFile = await taskService.getTaskById(id)
    res.status(200).json({ task: taskWithFile })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la tarea" })
  }
}