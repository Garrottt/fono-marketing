import { Request, Response } from "express"
import * as goalService from "../services/goal.service"
import * as patientService from "../services/patient.service"
import { CreateGoalInput, CreateOperationalGoalInput, UpdateOperationalGoalInput } from "../types/goal.types"

export const getGoalsByPatient = async (req: Request, res: Response): Promise<void> => {
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

    const goals = await goalService.getGoalsByPatient(patientId)
    res.status(200).json({ goals })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los objetivos" })
  }
}

export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const professionalId = req.user!.id
    const { description, startDate, endDate }: CreateGoalInput = req.body

    const patient = await patientService.getPatientById(patientId, professionalId)
    if (!patient) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    if (!description || !startDate || !endDate) {
      res.status(400).json({ message: "Descripción, fecha de inicio y fecha de fin son requeridas" })
      return
    }

    const goal = await goalService.createGoal({ description, startDate, endDate }, patientId)
    res.status(201).json({ goal })
  } catch (error) {
    res.status(500).json({ message: "Error al crear el objetivo" })
  }
}

export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { completed } = req.body

    const goal = await goalService.updateGoal(id, completed)
    res.status(200).json({ goal })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el objetivo" })
  }
}

export const createOperationalGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const goalId = req.params.goalId as string
    const { description, order }: CreateOperationalGoalInput = req.body

    if (!description || order === undefined) {
      res.status(400).json({ message: "Descripción y orden son requeridos" })
      return
    }

    const operationalGoal = await goalService.createOperationalGoal({ description, order }, goalId)
    res.status(201).json({ operationalGoal })
  } catch (error) {
    res.status(500).json({ message: "Error al crear el objetivo operacional" })
  }
}

export const updateOperationalGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const data: UpdateOperationalGoalInput = req.body

    const operationalGoal = await goalService.updateOperationalGoal(id, data)
    res.status(200).json({ operationalGoal })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el objetivo operacional" })
  }
}
export const updateGoalDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const { description, startDate, endDate } = req.body

    const goal = await goalService.updateGoalDescription(id, { description, startDate, endDate })
    res.status(200).json({ goal })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el objetivo" })
  }
}

export const deleteOperationalGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string

    const result = await goalService.deleteOperationalGoal(id)
    if (!result) {
      res.status(404).json({ message: "Paso no encontrado" })
      return
    }

    res.status(200).json({ message: "Paso eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el paso" })
  }
}

export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    await goalService.deleteGoal(id)
    res.status(200).json({ message: "Objetivo eliminado correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el objetivo" })
  }
}
