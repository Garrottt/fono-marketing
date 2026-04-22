import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"
import { CreatePatientInput, PortalAccessInput, UpdatePatientInput } from "../types/patient.types"

const patientInclude = {
  user: {
    select: {
      id: true,
      email: true
    }
  },
  anamnesis: {
    select: {
      id: true,
      updatedAt: true,
      hasDiabetesOrImmunosuppression: true,
      hasPreviousEarSurgeries: true,
      otorrea: true,
      otorragia: true
    }
  },
  preLavadoEvaluation: {
    select: {
      id: true,
      updatedAt: true,
      aptoParaLavado: true,
      precautionAlerts: true,
      criticalBlocks: true,
      diagnosticSummary: true
    }
  }
} as const

export const getAllPatients = async (professionalId: string) => {
  return prisma.patient.findMany({
    where: {
      professionalId,
      active: true
    },
    include: patientInclude,
    orderBy: {
      createdAt: "desc"
    }
  })
}

export const getPatientById = async (id: string, professionalId: string) => {
  return prisma.patient.findFirst({
    where: {
      id,
      professionalId
    },
    include: patientInclude
  })
}

export const createPatient = async (data: CreatePatientInput, professionalId: string) => {
  return prisma.patient.create({
    data: {
      ...data,
      professionalId
    },
    include: patientInclude
  })
}

export const updatePatient = async (id: string, data: UpdatePatientInput) => {
  return prisma.patient.update({
    where: { id },
    data,
    include: patientInclude
  })
}

export const configurePortalAccess = async (patientId: string, patientName: string, data: PortalAccessInput) => {
  const passwordHash = await bcrypt.hash(data.password, 10)

  return prisma.user.upsert({
    where: { patientId },
    update: {
      name: patientName,
      email: data.email,
      passwordHash,
      role: "PATIENT"
    },
    create: {
      name: patientName,
      email: data.email,
      passwordHash,
      role: "PATIENT",
      patientId
    },
    select: {
      id: true,
      name: true,
      email: true,
      patientId: true
    }
  })
}

export const deactivatePatient = async (id: string) => {
  return prisma.patient.update({
    where: { id },
    data: { active: false },
    include: patientInclude
  })
}
