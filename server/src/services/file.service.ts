import prisma from "../lib/prisma"

export const getFilesByPatient = async (patientId: string) => {
  return prisma.file.findMany({
    where: { patientId },
    orderBy: { uploadedAt: "desc" }
  })
}

export const createFile = async (
  patientId: string,
  professionalId: string,
  filename: string,
  url: string,
  filetype: string,
  taskId?: string,
  sessionTaskId?: string
) => {
  return prisma.file.create({
    data: {
      patientId,
      professionalId,
      filename,
      url,
      filetype,
      ...(taskId && { taskId }),
      ...(sessionTaskId && { sessionTaskId })
    }
  })
}

export const deleteFile = async (id: string) => {
  return prisma.file.delete({
    where: { id }
  })
}

export const getFileById = async (id: string) => {
  return prisma.file.findFirst({
    where: { id }
  })
}
