import prisma from "../lib/prisma"
import { CreateGoalInput, CreateOperationalGoalInput, UpdateOperationalGoalInput } from "../types/goal.types"

type GoalOperationalGoal = Awaited<ReturnType<typeof prisma.operationalGoal.findMany>>[number]

export const getGoalsByPatient = async (patientId: string) => {
  return prisma.goal.findMany({
    where: { patientId },
    include: {
      operationalGoals: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: { startDate: "asc" }
  })
}

export const createGoal = async (data: CreateGoalInput, patientId: string) => {
  return prisma.goal.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      patientId
    },
    include: {
      operationalGoals: true
    }
  })
}

export const updateGoal = async (id: string, completed: boolean) => {
  return prisma.goal.update({
    where: { id },
    data: { completed }
  })
}

export const createOperationalGoal = async (
  data: CreateOperationalGoalInput,
  goalId: string
) => {
  return prisma.operationalGoal.create({
    data: {
      ...data,
      goalId
    }
  })
}

export const updateOperationalGoal = async (
  id: string,
  data: UpdateOperationalGoalInput
) => {
  const updated = await prisma.operationalGoal.update({
    where: { id },
    data
  })

  const allOps = await prisma.operationalGoal.findMany({
    where: { goalId: updated.goalId }
  })

  const allCompleted = allOps.length > 0 && allOps.every((op: GoalOperationalGoal) => op.completed)

  await prisma.goal.update({
    where: { id: updated.goalId },
    data: { completed: allCompleted }
  })

  return updated
}
export const deleteOperationalGoal = async (id: string) => {
  const op = await prisma.operationalGoal.findFirst({ where: { id } })
  if (!op) return null

  await prisma.operationalGoal.delete({ where: { id } })

  // Recalcular si el objetivo principal sigue completado
  const remaining = await prisma.operationalGoal.findMany({
    where: { goalId: op.goalId }
  })

  const allCompleted = remaining.length > 0 && remaining.every((o: GoalOperationalGoal) => o.completed)

  await prisma.goal.update({
    where: { id: op.goalId },
    data: { completed: allCompleted }
  })

  return op
}
export const updateGoalDescription = async (
  id: string,
  data: { description?: string; startDate?: string; endDate?: string }
) => {
  return prisma.goal.update({
    where: { id },
    data: {
      ...(data.description && { description: data.description }),
      ...(data.startDate && { startDate: new Date(data.startDate + "T12:00:00") }),
      ...(data.endDate && { endDate: new Date(data.endDate + "T12:00:00") })
    }
  })
}
export const deleteGoal = async (id: string) => {
  return prisma.goal.delete({
    where: { id }
  })
}
