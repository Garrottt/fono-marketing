import prisma from "../lib/prisma"
import {
  CreateSessionInput,
  SessionSpecificObjectiveInput,
  SessionTaskInput,
  UpdateSessionInput
} from "../types/session.types"

type SessionTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

const sessionInclude = {
  specificObjectives: {
    orderBy: { order: "asc" as const },
    include: {
      operationalObjectives: {
        orderBy: { order: "asc" as const }
      }
    }
  },
  sessionTasks: {
    orderBy: { order: "asc" as const },
    include: {
      files: {
        orderBy: { uploadedAt: "desc" as const }
      }
    }
  }
}

const reindexSessionsForPatient = async (patientId: string, tx: SessionTransactionClient) => {
  const sessions = await tx.session.findMany({
    where: { patientId },
    orderBy: [
      { date: "asc" },
      { createdAt: "asc" }
    ],
    select: { id: true }
  })

  // Avoid unique collisions on (patientId, sessionNumber) while reordering.
  for (const [index, session] of sessions.entries()) {
    await tx.session.update({
      where: { id: session.id },
      data: { sessionNumber: sessions.length + index + 1 }
    })
  }

  for (const [index, session] of sessions.entries()) {
    await tx.session.update({
      where: { id: session.id },
      data: { sessionNumber: index + 1 }
    })
  }
}

const syncSpecificObjectives = async (
  sessionId: string,
  specificObjectives: SessionSpecificObjectiveInput[],
  tx: SessionTransactionClient
) => {
  const existingSpecificObjectives = await tx.sessionSpecificObjective.findMany({
    where: { sessionId },
    include: { operationalObjectives: true }
  })

  const payloadSpecificIds = specificObjectives
    .map((specificObjective) => specificObjective.id)
    .filter(Boolean) as string[]

  const deletableSpecificIds = existingSpecificObjectives
    .filter((specificObjective) => !payloadSpecificIds.includes(specificObjective.id))
    .map((specificObjective) => specificObjective.id)

  if (deletableSpecificIds.length > 0) {
    await tx.sessionSpecificObjective.deleteMany({
      where: { id: { in: deletableSpecificIds } }
    })
  }

  for (const specificObjective of specificObjectives) {
    let currentSpecificObjectiveId = specificObjective.id

    if (currentSpecificObjectiveId && existingSpecificObjectives.some((item) => item.id === currentSpecificObjectiveId)) {
      await tx.sessionSpecificObjective.update({
        where: { id: currentSpecificObjectiveId },
        data: {
          description: specificObjective.description,
          order: specificObjective.order
        }
      })
    } else {
      const createdSpecificObjective = await tx.sessionSpecificObjective.create({
        data: {
          sessionId,
          description: specificObjective.description,
          order: specificObjective.order
        }
      })
      currentSpecificObjectiveId = createdSpecificObjective.id
    }

    const existingOperationalObjectives = existingSpecificObjectives.find(
      (item) => item.id === currentSpecificObjectiveId
    )?.operationalObjectives ?? []

    const payloadOperationalIds = specificObjective.operationalObjectives
      .map((operationalObjective) => operationalObjective.id)
      .filter(Boolean) as string[]

    const deletableOperationalIds = existingOperationalObjectives
      .filter((operationalObjective) => !payloadOperationalIds.includes(operationalObjective.id))
      .map((operationalObjective) => operationalObjective.id)

    if (deletableOperationalIds.length > 0) {
      await tx.sessionOperationalObjective.deleteMany({
        where: { id: { in: deletableOperationalIds } }
      })
    }

    for (const operationalObjective of specificObjective.operationalObjectives) {
      if (operationalObjective.id && existingOperationalObjectives.some((item) => item.id === operationalObjective.id)) {
      await tx.sessionOperationalObjective.update({
        where: { id: operationalObjective.id },
        data: {
          description: operationalObjective.description,
          activities: operationalObjective.activities ?? [],
          order: operationalObjective.order
        }
      })
    } else {
      await tx.sessionOperationalObjective.create({
        data: {
          specificObjectiveId: currentSpecificObjectiveId!,
          description: operationalObjective.description,
          activities: operationalObjective.activities ?? [],
          order: operationalObjective.order
        }
      })
    }
    }
  }
}

const syncSessionTasks = async (
  sessionId: string,
  sessionTasks: SessionTaskInput[],
  tx: SessionTransactionClient
) => {
  const existingTasks = await tx.sessionTask.findMany({
    where: { sessionId }
  })

  const payloadTaskIds = sessionTasks
    .map((sessionTask) => sessionTask.id)
    .filter(Boolean) as string[]

  const deletableTaskIds = existingTasks
    .filter((sessionTask) => !payloadTaskIds.includes(sessionTask.id))
    .map((sessionTask) => sessionTask.id)

  if (deletableTaskIds.length > 0) {
    await tx.sessionTask.deleteMany({
      where: { id: { in: deletableTaskIds } }
    })
  }

  for (const sessionTask of sessionTasks) {
    if (sessionTask.id && existingTasks.some((item) => item.id === sessionTask.id)) {
      await tx.sessionTask.update({
        where: { id: sessionTask.id },
        data: {
          title: sessionTask.title,
          description: sessionTask.description,
          order: sessionTask.order
        }
      })
    } else {
      await tx.sessionTask.create({
        data: {
          sessionId,
          title: sessionTask.title,
          description: sessionTask.description,
          order: sessionTask.order
        }
      })
    }
  }
}

const applyNestedSessionData = async (
  sessionId: string,
  data: Pick<CreateSessionInput, "specificObjectives" | "sessionTasks">,
  tx: SessionTransactionClient
) => {
  await syncSpecificObjectives(sessionId, data.specificObjectives, tx)
  await syncSessionTasks(sessionId, data.sessionTasks, tx)
}

export const getSessionsByPatient = async (patientId: string) => {
  return prisma.session.findMany({
    where: { patientId },
    include: sessionInclude,
    orderBy: [
      { date: "desc" },
      { sessionNumber: "desc" }
    ]
  })
}

export const getSessionById = async (id: string) => {
  return prisma.session.findFirst({
    where: { id },
    include: sessionInclude
  })
}

export const getSessionTaskById = async (id: string) => {
  return prisma.sessionTask.findFirst({
    where: { id },
    include: {
      session: {
        select: {
          id: true,
          patientId: true,
          professionalId: true
        }
      },
      files: {
        orderBy: { uploadedAt: "desc" }
      }
    }
  })
}

export const createSession = async (
  data: CreateSessionInput,
  patientId: string,
  professionalId: string
) => {
  const sessionId = await prisma.$transaction(async (tx) => {
    const lastSession = await tx.session.findFirst({
      where: { patientId },
      orderBy: { sessionNumber: "desc" },
      select: { sessionNumber: true }
    })

    const session = await tx.session.create({
      data: {
        patientId,
        professionalId,
        sessionNumber: (lastSession?.sessionNumber ?? 0) + 1,
        date: new Date(data.date),
        whatWasDone: data.whatWasDone,
        contentHierarchy: data.contentHierarchy,
        hierarchyCriteria: data.hierarchyCriteria,
        focus: data.focus,
        modality: data.modality,
        strategies: data.strategies,
        generalObjective: data.generalObjective
      }
    })

    await applyNestedSessionData(session.id, data, tx)
    await reindexSessionsForPatient(patientId, tx)

    return session.id
  })

  return getSessionById(sessionId)
}

export const updateSession = async (id: string, data: UpdateSessionInput) => {
  const existingSession = await prisma.session.findFirst({
    where: { id },
    select: { patientId: true }
  })

  if (!existingSession) return null

  await prisma.$transaction(async (tx) => {
    await tx.session.update({
      where: { id },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.whatWasDone !== undefined && { whatWasDone: data.whatWasDone }),
        ...(data.contentHierarchy && { contentHierarchy: data.contentHierarchy }),
        ...(data.hierarchyCriteria !== undefined && { hierarchyCriteria: data.hierarchyCriteria }),
        ...(data.focus !== undefined && { focus: data.focus }),
        ...(data.modality !== undefined && { modality: data.modality }),
        ...(data.strategies !== undefined && { strategies: data.strategies }),
        ...(data.generalObjective !== undefined && { generalObjective: data.generalObjective })
      }
    })

    if (data.specificObjectives) {
      await syncSpecificObjectives(id, data.specificObjectives, tx)
    }

    if (data.sessionTasks) {
      await syncSessionTasks(id, data.sessionTasks, tx)
    }

    await reindexSessionsForPatient(existingSession.patientId, tx)
  })

  return getSessionById(id)
}

export const deleteSession = async (id: string) => {
  const existingSession = await prisma.session.findFirst({
    where: { id },
    select: { patientId: true }
  })

  if (!existingSession) return null

  await prisma.$transaction(async (tx) => {
    await tx.session.delete({
      where: { id }
    })

    await reindexSessionsForPatient(existingSession.patientId, tx)
  })

  return existingSession
}
