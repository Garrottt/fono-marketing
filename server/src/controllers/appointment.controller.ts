import { Request, Response } from "express"
import * as appointmentService from "../services/appointment.service"
import { CreateAppointmentInput, UpdateAppointmentInput } from "../types/appointment.types"
import { sendAppointmentCreatedEmail, sendAppointmentRescheduledEmail } from "../utils/mailer"
import { chileLocalDateTimeToUtc } from "../utils/timezone"

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const professionalId = req.user!.id
    const appointments = await appointmentService.getAppointmentsByProfessional(professionalId)
    res.status(200).json({ appointments })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las citas" })
  }
}

export const getAppointmentsByPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId as string
    const role = req.user!.role

    if (role === "PATIENT" && req.user!.id !== patientId) {
      res.status(403).json({ message: "No tienes permisos para acceder a este paciente" })
      return
    }

    const appointments = await appointmentService.getAppointmentsByPatient(patientId)

    if (role === "PROFESSIONAL" && appointments.some((appointment) => appointment.professionalId !== req.user!.id)) {
      res.status(404).json({ message: "Paciente no encontrado" })
      return
    }

    res.status(200).json({ appointments })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las citas" })
  }
}

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const professionalId = req.user!.id
    const data: CreateAppointmentInput = req.body

    if (!data.patientId || !data.datetime) {
      res.status(400).json({ message: "Paciente y fecha son requeridos" })
      return
    }

    const appointment = await appointmentService.createAppointment(data, professionalId)

    if (appointment.patient.email) {
      void sendAppointmentCreatedEmail(
          appointment.patient.email,
          appointment.patient.name,
          appointment.datetime
        ).catch((err) => {
          console.error("Error enviando correo de confirmacion:", err)
        })
    }

    res.status(201).json({ appointment })
  } catch (error) {
    console.error("Error completo:", error)
    res.status(500).json({ message: "Error al crear la cita" })
  }
}

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id
    const data: UpdateAppointmentInput = req.body

    const existing = await appointmentService.getAppointmentById(id)
    if (!existing || existing.professionalId !== professionalId) {
      res.status(404).json({ message: "Cita no encontrada" })
      return
    }

    const appointmentDateChanged =
      data.datetime !== undefined &&
      chileLocalDateTimeToUtc(data.datetime).getTime() !== existing.datetime.getTime()

    const appointment = await appointmentService.updateAppointment(id, data)

    if (appointmentDateChanged && existing.patient.email) {
      void sendAppointmentRescheduledEmail(
          existing.patient.email,
          existing.patient.name,
          appointment.datetime
        ).catch((err) => {
          console.error("Error enviando correo de reagendamiento:", err)
        })
    }

    res.status(200).json({ appointment })
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la cita" })
  }
}

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string
    const professionalId = req.user!.id

    const existing = await appointmentService.getAppointmentById(id)
    if (!existing || existing.professionalId !== professionalId) {
      res.status(404).json({ message: "Cita no encontrada" })
      return
    }

    await appointmentService.deleteAppointment(id)
    res.status(200).json({ message: "Cita eliminada correctamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cita" })
  }
}
