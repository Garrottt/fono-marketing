import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

const EXECUTE_FLAG = "--execute"
const dryRun = !process.argv.includes(EXECUTE_FLAG)

const targetName = process.env.ADMIN_NAME?.trim()
const targetEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const targetPassword = process.env.ADMIN_PASSWORD
const legacyEmail = process.env.LEGACY_ADMIN_EMAIL?.trim().toLowerCase()

const requireValue = (value: string | undefined, label: string) => {
  if (!value) {
    throw new Error(`Debes definir ${label}.`)
  }

  return value
}

async function main() {
  const name = requireValue(targetName, "ADMIN_NAME")
  const email = requireValue(targetEmail, "ADMIN_EMAIL")
  const password = requireValue(targetPassword, "ADMIN_PASSWORD")

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.")
  }

  const professionals = await prisma.professional.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          patients: true,
          appointments: true,
          sessions: true,
          tasks: true,
          files: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  })

  console.log(`Modo: ${dryRun ? "dry-run" : "execute"}`)
  console.log(`Profesionales encontrados: ${professionals.length}`)
  professionals.forEach((professional) => {
    console.log(
      `- ${professional.email} | pacientes=${professional._count.patients} citas=${professional._count.appointments} sesiones=${professional._count.sessions} tareas=${professional._count.tasks} archivos=${professional._count.files}`
    )
  })

  const professionalByTargetEmail = professionals.find((item) => item.email === email)
  const professionalByLegacyEmail = legacyEmail
    ? professionals.find((item) => item.email === legacyEmail)
    : undefined

  let targetProfessional = professionalByTargetEmail
  const operations: string[] = []

  if (!targetProfessional && professionalByLegacyEmail) {
    operations.push(`Actualizar email legacy ${professionalByLegacyEmail.email} -> ${email}`)
    targetProfessional = professionalByLegacyEmail
  }

  if (!targetProfessional && professionals.length === 1) {
    operations.push(`Reutilizar unica cuenta profesional ${professionals[0].email} -> ${email}`)
    targetProfessional = professionals[0]
  }

  if (!targetProfessional) {
    throw new Error(
      "No pude determinar qué cuenta profesional consolidar. Define LEGACY_ADMIN_EMAIL si existe una cuenta antigua."
    )
  }

  const staleProfessionals = professionals.filter((item) => item.id !== targetProfessional!.id)

  for (const stale of staleProfessionals) {
    const hasRelations =
      stale._count.patients > 0 ||
      stale._count.appointments > 0 ||
      stale._count.sessions > 0 ||
      stale._count.tasks > 0 ||
      stale._count.files > 0

    if (hasRelations) {
      throw new Error(`La cuenta ${stale.email} aun tiene datos asociados y no se puede eliminar automaticamente.`)
    }

    operations.push(`Eliminar cuenta profesional antigua ${stale.email}`)
  }

  operations.push(`Actualizar nombre/password de ${targetProfessional.email} a ${name} / ${email}`)

  console.log("Cambios planificados:")
  operations.forEach((operation) => console.log(`- ${operation}`))

  if (dryRun) {
    console.log("Dry-run completado. No se realizaron cambios.")
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.$transaction(async (tx) => {
    await tx.professional.update({
      where: { id: targetProfessional!.id },
      data: {
        name,
        email,
        passwordHash,
        role: "PROFESSIONAL"
      }
    })

    for (const stale of staleProfessionals) {
      await tx.professional.delete({
        where: { id: stale.id }
      })
    }
  })

  console.log(`Cuenta profesional consolidada en ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
