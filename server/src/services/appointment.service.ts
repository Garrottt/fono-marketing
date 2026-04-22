import prisma from "../lib/prisma"
import { AppointmentStatus } from "@prisma/client"
import { CreateAppointmentInput, UpdateAppointmentInput } from "../types/appointment.types"
import { chileLocalDateTimeToUtc } from "../utils/timezone"

const normalizeReminderInputs = (reminderScheduledAts?: string[]) =>
  (reminderScheduledAts ?? [])
    .map((value) => value.trim())
    .filter(Boolean)

export const getAppointmentsByProfessional = async (professionalId: string) => {
  return prisma.appointment.findMany({
    where: { professionalId },
    include: {
      patient: true,
      reminders: {
        orderBy: { scheduledAt: "asc" }
      }
    },
    orderBy: { datetime: "asc" }
  })
}

export const getAppointmentsByPatient = async (patientId: string) => {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      reminders: {
        orderBy: { scheduledAt: "asc" }
      }
    },
    orderBy: { datetime: "asc" }
  })
}

export const createAppointment = async (
  data: CreateAppointmentInput,
  professionalId: string
) => {
  const reminders = normalizeReminderInputs(data.reminderScheduledAts)

  return prisma.appointment.create({
    data: {
      patientId: data.patientId,
      professionalId,
      datetime: chileLocalDateTimeToUtc(data.datetime),
      notes: data.notes,
      reminders: reminders.length > 0
        ? {
            create: reminders.map((reminderScheduledAt) => ({
              scheduledAt: chileLocalDateTimeToUtc(reminderScheduledAt)
            }))
          }
        : undefined
    },
    include: {
      patient: true,
      reminders: {
        orderBy: { scheduledAt: "asc" }
      }
    }
  })
}

export const updateAppointment = async (
  id: string,
  data: UpdateAppointmentInput
) => {
  const reminders = data.reminderScheduledAts !== undefined
    ? normalizeReminderInputs(data.reminderScheduledAts)
    : undefined

  return prisma.appointment.update({
    where: { id },
    data: {
      ...(data.datetime && {
        datetime: chileLocalDateTimeToUtc(data.datetime)
      }),
      ...(reminders !== undefined && {
        reminders: {
          deleteMany: {},
          ...(reminders.length > 0 && {
            create: reminders.map((reminderScheduledAt) => ({
              scheduledAt: chileLocalDateTimeToUtc(reminderScheduledAt)
            }))
          })
        }
      }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.status !== undefined && { status: data.status as AppointmentStatus })
    },
    include: {
      patient: true,
      reminders: {
        orderBy: { scheduledAt: "asc" }
      }
    }
  })
}

export const deleteAppointment = async (id: string) => {
  return prisma.appointment.delete({
    where: { id }
  })
}

export const getAppointmentById = async (id: string) => {
  return prisma.appointment.findFirst({
    where: { id },
    include: {
      patient: true,
      reminders: {
        orderBy: { scheduledAt: "asc" }
      }
    }
  })
}
