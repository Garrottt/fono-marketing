import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

async function main() {
  const passwordHash = await bcrypt.hash("paciente1234", 10)

  const patient = await prisma.patient.update({
    where: {
      id: "ID_DEL_PACIENTE"
    },
    data: {
      email: "paciente@fonapp.com",
    }
  })

  console.log("Paciente actualizado:", patient)

  // Crear credenciales de acceso en una tabla separada no existe aún
  // Por ahora usamos el mismo modelo Professional con rol PATIENT
  const user = await prisma.professional.create({
    data: {
      name: patient.name,
      email: "paciente@fonapp.com",
      passwordHash,
      role: "PROFESSIONAL"
    }
  })

  console.log("Usuario creado:", user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())