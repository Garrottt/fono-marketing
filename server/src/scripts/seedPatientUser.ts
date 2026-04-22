import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

async function main() {
  // Primero listamos los pacientes para elegir uno
  const patients = await prisma.patient.findMany({
    select: { id: true, name: true, email: true }
  })

  console.log("Pacientes disponibles:")
  patients.forEach(p => console.log(`- ${p.name} | id: ${p.id}`))

  // Cambiá este id por el del paciente que querés vincular
  const patientId = "c261bb7f-66ab-48ec-9aa1-545bffbdb1d7"
  const email = "paciente@fonapp.com"
  const password = "paciente1234"

  // Verificar que no exista ya un usuario con ese email
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("Ya existe un usuario con ese email")
    return
  }

  const patient = await prisma.patient.findFirst({ where: { id: patientId } })
  if (!patient) {
    console.log("Paciente no encontrado")
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: patient.name,
      email,
      passwordHash,
      role: "PATIENT",
      patientId
    }
  })

  console.log("Usuario paciente creado:", user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())