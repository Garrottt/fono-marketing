import { Request, Response } from "express"
import fs from "fs"
import path from "path"
import * as sessionService from "../services/session.service"
import * as patientService from "../services/patient.service"
import * as fileService from "../services/file.service"
import { CreateSessionInput, SessionSpecificObjectiveInput, SessionTaskInput, UpdateSessionInput } from "../types/session.types"

const hasValidSpecificObjectives = (specificObjectives: SessionSpecificObjectiveInput[] | undefined) =>
  (specificObjectives ?? []).every((specificObjective) =>
    specificObjective.description.trim() &&
    specificObjective.operationalObjectives.length > 0 &&
    specificObjective.operationalObjectives.every((operationalObjective) => operationalObjective.description.trim())
  )

const getPatientPlanning = (patient: {
  contentHierarchy?: string[]
  hierarchyCriteria?: string
  focus?: string
  modality?: string
  strategies?: string
  generalObjective?: string
}) => ({
  contentHierarchy: (patient.contentHierarchy ?? []).map((item) => item.trim()).filter(Boolean),
  hierarchyCriteria: patient.hierarchyCriteria?.trim() || "",
  focus: patient.focus?.trim() || "",
  modality: patient.modality?.trim() || "",
  strategies: patient.strategies?.trim() || "",
  generalObjective: patient.generalObjective?.trim() || ""
})

const normalizeSessionTasks = (sessionTasks: SessionTaskInput[] | undefined) =>
  (sessionTasks ?? [])
    .map((sessionTask, index) => ({
      ...sessionTask,
      order: index + 1,
      title: sessionTask.title.trim(),
      description: sessionTask.description?.trim() || undefined
    }))
    .filter((sessionTask) => sessionTask.title)

const normalizeSpecificObjectives = (specificObjectives: SessionSpecificObjectiveInput[] | undefined) =>
  (specificObjectives ?? [])
    .map((specificObjective, specificIndex) => ({
      ...specificObjective,
      order: specificIndex + 1,
      description: specificObjective.description.trim(),
      operationalObjectives: specificObjective.operationalObjectives
        .map((operationalObjective, operationalIndex) => ({
          ...operationalObjective,
          order: operationalIndex + 1,
          description: operationalObjective.description.trim(),
          activities: (operationalObjective.activities ?? [])
            .map((activity) => activity.trim())
            .filter(Boolean)
            .slice(0, 3)
        }))
        .filter((operationalObjective) => operationalObjective.description)
    }))
    .filter((specificObjective) => specificObjective.description)

export const getSessionsByPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const role = req.user!.role

    if (role === "PATIENT" && req.user!.id !== patientId) {
      res.status(403).json({ message: "No tienes permisos para acceder a este paciente" })
      return
    }

    if (role === "PROFESSIONAL") {
      const patient = await patientService.getPatientById(patientId, req.user!.id)
      if (!patient) {
        res.status(404).json({ message: "Paciente no encontrado" })
        return
      }
    }

    const sessions = await sessionService.getSessionsByPatient(patientId)
    res.status(200).json({ sessions })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las sesiónes" })
  }
}

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const professionalId = req.user!.id
    const {
      date,
      whatWasDone,
      contentHierarchy,
      hierarchyCriteria,
      focus,
      modality,
      strategies,
      generalObjective,
      specificObjectives,
      sessionTasks
    }: CreateSessionInput = req.body

    const patient = await patientService.getPatientById(patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const normalizedSpecificObjectives = normalizeSpecificObjectives(specificObjectives)
    const normalizedSessionTasks = normalizeSessionTasks(sessionTasks)
    const patientPlanning = getPatientPlanning(patient as {
      contentHierarchy?: string[]
      hierarchyCriteria?: string
      focus?: string
      modality?: string
      strategies?: string
      generalObjective?: string
    })
    const resolvedPlanning = {
      contentHierarchy: patientPlanning.contentHierarchy.length > 0
        ? patientPlanning.contentHierarchy
        : (contentHierarchy ?? []).map((item) => item.trim()).filter(Boolean),
      hierarchyCriteria: patientPlanning.hierarchyCriteria || hierarchyCriteria?.trim() || "",
      focus: patientPlanning.focus || focus?.trim() || "",
      modality: patientPlanning.modality || modality?.trim() || "",
      strategies: patientPlanning.strategies || strategies?.trim() || "",
      generalObjective: patientPlanning.generalObjective || generalObjective?.trim() || ""
    }

    if (!date) {
      res.status(400).json({ message: "La fecha de la sesión es requerida" })
      return
    }

    if (!hasValidSpecificObjectives(normalizedSpecificObjectives)) {
      res.status(400).json({ message: "Cada objetivo específico debe incluir al menos un objetivo operacional válido" })
      return
    }

    const session = await sessionService.createSession(
      {
        date,
        whatWasDone: whatWasDone?.trim() || "",
        contentHierarchy: resolvedPlanning.contentHierarchy,
        hierarchyCriteria: resolvedPlanning.hierarchyCriteria,
        focus: resolvedPlanning.focus,
        modality: resolvedPlanning.modality,
        strategies: resolvedPlanning.strategies,
        generalObjective: resolvedPlanning.generalObjective,
        specificObjectives: normalizedSpecificObjectives,
        sessionTasks: normalizedSessionTasks
      },
      patientId,
      professionalId
    )

    res.status(201).json({ session })
  } catch (error) {
    res.status(500).json({ message: "Error al crear la sesión" })
  }
}

export const updateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id
    const data: UpdateSessionInput = req.body

    const existing = await sessionService.getSessionById(id)

    if (!existing || existing.professionalId !== professionalId) {
      res.status(404).json({ message: "Sesión no encontrada" })
      return
    }

    const patient = await patientService.getPatientById(existing.patientId, professionalId)

    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    const normalizedSpecificObjectives = data.specificObjectives
      ? normalizeSpecificObjectives(data.specificObjectives)
      : undefined
    const normalizedSessionTasks = data.sessionTasks
      ? normalizeSessionTasks(data.sessionTasks)
      : undefined
    const patientPlanning = getPatientPlanning(patient as {
      contentHierarchy?: string[]
      hierarchyCriteria?: string
      focus?: string
      modality?: string
      strategies?: string
      generalObjective?: string
    })
    const resolvedPlanning = {
      contentHierarchy: patientPlanning.contentHierarchy.length > 0
        ? patientPlanning.contentHierarchy
        : (data.contentHierarchy ? data.contentHierarchy.map((item) => item.trim()).filter(Boolean) : existing.contentHierarchy),
      hierarchyCriteria: patientPlanning.hierarchyCriteria || data.hierarchyCriteria?.trim() || existing.hierarchyCriteria,
      focus: patientPlanning.focus || data.focus?.trim() || existing.focus,
      modality: patientPlanning.modality || data.modality?.trim() || existing.modality,
      strategies: patientPlanning.strategies || data.strategies?.trim() || existing.strategies,
      generalObjective: patientPlanning.generalObjective || data.generalObjective?.trim() || existing.generalObjective
    }

    if (normalizedSpecificObjectives && !hasValidSpecificObjectives(normalizedSpecificObjectives)) {
      res.status(400).json({ message: "Cada objetivo específico debe incluir al menos un objetivo operacional válido" })
      return
    }

    const session = await sessionService.updateSession(id, {
      ...data,
      whatWasDone: data.whatWasDone?.trim(),
      contentHierarchy: resolvedPlanning.contentHierarchy,
      hierarchyCriteria: resolvedPlanning.hierarchyCriteria,
      focus: resolvedPlanning.focus,
      modality: resolvedPlanning.modality,
      strategies: resolvedPlanning.strategies,
      generalObjective: resolvedPlanning.generalObjective,
      specificObjectives: normalizedSpecificObjectives,
      sessionTasks: normalizedSessionTasks
    })

    res.status(200).json({ session })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la sesión" })
  }
}

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const session = await sessionService.getSessionById(id)

    if (!session) {
      res.status(404).json({ message: "Sesión no encontrada" })
      return
    }

    res.status(200).json({ session })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la sesión" })
  }
}

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id

    const existing = await sessionService.getSessionById(id)

    if (!existing || existing.professionalId !== professionalId) {
      res.status(404).json({ message: "Sesión no encontrada" })
      return
    }

    await sessionService.deleteSession(id)
    res.status(200).json({ message: "Sesión eliminada correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la sesión" })
  }
}

export const uploadSessionTaskFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id as string
    const sessionTaskId = req.params.taskId as string
    const professionalId = req.user!.id

    const session = await sessionService.getSessionById(sessionId)

    if (!session || session.professionalId !== professionalId) {
      res.status(404).json({ message: "Sesión no encontrada" })
      return
    }

    const sessionTask = await sessionService.getSessionTaskById(sessionTaskId)

    if (!sessionTask || sessionTask.sessionId !== sessionId) {
      res.status(404).json({ message: "Indicacion de sesión no encontrada" })
      return
    }

    if (!req.file) {
      res.status(400).json({ message: "No se recibio ningún archivo" })
      return
    }

    const file = await fileService.createFile(
      session.patientId,
      professionalId,
      req.file.originalname,
      `/uploads/${req.file.filename}`,
      req.file.mimetype,
      undefined,
      sessionTaskId
    )

    res.status(201).json({ file })
  } catch (error) {
    res.status(500).json({ message: "Error al subir el archivo de la sesión" })
  }
}

export const deleteSessionTaskFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id as string
    const sessionTaskId = req.params.taskId as string
    const fileId = req.params.fileId as string
    const professionalId = req.user!.id

    const session = await sessionService.getSessionById(sessionId)

    if (!session || session.professionalId !== professionalId) {
      res.status(404).json({ message: "Sesión no encontrada" })
      return
    }

    const sessionTask = await sessionService.getSessionTaskById(sessionTaskId)
    const existingFile = await fileService.getFileById(fileId)

    if (!sessionTask || sessionTask.sessionId !== sessionId || !existingFile || existingFile.sessionTaskId !== sessionTaskId) {
      res.status(404).json({ message: "Archivo de la sesión no encontrado" })
      return
    }

    const filePath = path.join(process.cwd(), existingFile.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await fileService.deleteFile(fileId)
    res.status(200).json({ message: "Archivo eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el archivo de la sesión" })
  }
}
