import prisma from "../lib/prisma"
import { CreateTaskInput, UpdateTaskInput } from "../types/task.types"

export const createTask = async (
  data: CreateTaskInput,
  patientId: string,
  professionalId: string
) => {
  return prisma.task.create({
    data: {
      ...data,
      patientId,
      professionalId
    }
  })
}

export const deleteTask = async (id: string) => {
  return prisma.task.delete({
    where: { id }
  })
}

export const getTaskById = async (id: string) => {
  return prisma.task.findFirst({
    where: { id },
    include: { files: true }
  })
}

export const getTasksByPatient = async (patientId: string) => {
  return prisma.task.findMany({
    where: { patientId },
    include: { files: true },
    orderBy: { assignedAt: "desc" }
  })
}
export const updateTask = async (
  id: string,
  data: UpdateTaskInput
) => {
  return prisma.task.update({
    where: { id },
    data,
    include: { files: true }
  })
}