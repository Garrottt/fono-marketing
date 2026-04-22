import fs from "fs"
import path from "path"
import prisma from "../lib/prisma"

const EXECUTE_FLAG = "--execute"
const DRY_RUN_FLAG = "--dry-run"
const CONFIRMATION_VALUE = "DELETE_ALL_TEST_PATIENTS"
const confirmationInput = process.env.CONFIRM_PATIENT_DATA_PURGE

const getDatabaseTarget = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return "DATABASE_URL no configurada"
  }

  try {
    const url = new URL(connectionString)
    const databaseName = url.pathname.replace(/^\//, "") || "(sin nombre)"
    return `${url.hostname}/${databaseName}`
  } catch {
    return "DATABASE_URL no se pudo interpretar"
  }
}

const removeLeadingSlash = (value: string) => value.replace(/^[/\\]+/, "")

async function main() {
  const execute = process.argv.includes(EXECUTE_FLAG)
  const dryRun = process.argv.includes(DRY_RUN_FLAG) || !execute
  const databaseTarget = getDatabaseTarget()

  const patientCount = await prisma.patient.count()
  const patientPortalUserCount = await prisma.user.count({
    where: {
      patientId: {
        not: null
      }
    }
  })
  const passwordTokenCount = await prisma.passwordSetupToken.count({
    where: {
      user: {
        patientId: {
          not: null
        }
      }
    }
  })
  const fileRecords = await prisma.file.findMany({
    select: {
      id: true,
      url: true
    }
  })

  console.log(`Base objetivo: ${databaseTarget}`)
  console.log(`Modo: ${dryRun ? "dry-run" : "execute"}`)
  console.log(`Pacientes a eliminar: ${patientCount}`)
  console.log(`Usuarios portal paciente a eliminar: ${patientPortalUserCount}`)
  console.log(`Tokens de configuracion de password a eliminar: ${passwordTokenCount}`)
  console.log(`Registros de archivos a eliminar: ${fileRecords.length}`)

  if (dryRun) {
    console.log("Dry-run completado. No se realizaron cambios.")
    return
  }

  if (confirmationInput !== CONFIRMATION_VALUE) {
    throw new Error(
      `Falta confirmacion explicita. Define CONFIRM_PATIENT_DATA_PURGE=${CONFIRMATION_VALUE} para ejecutar.`
    )
  }

  const absoluteFilePaths = fileRecords.map((file) =>
    path.join(process.cwd(), removeLeadingSlash(file.url))
  )

  await prisma.$transaction([
    prisma.passwordSetupToken.deleteMany({
      where: {
        user: {
          patientId: {
            not: null
          }
        }
      }
    }),
    prisma.user.deleteMany({
      where: {
        patientId: {
          not: null
        }
      }
    }),
    prisma.patient.deleteMany()
  ])

  let deletedPhysicalFiles = 0
  for (const filePath of absoluteFilePaths) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      deletedPhysicalFiles += 1
    }
  }

  console.log("Purgado completado.")
  console.log(`Archivos fisicos eliminados: ${deletedPhysicalFiles}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
