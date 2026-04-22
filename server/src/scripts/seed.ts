import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

async function main() {

    // 10 cuántas veces procesa el hash
  const passwordHash = await bcrypt.hash("admin1234", 10)

  const professional = await prisma.professional.create({
    data: {
      name: "Administrador",
      email: "admin@fonapp.com",
      passwordHash,
      role: "PROFESSIONAL"
    }
  })

  console.log("Profesional creado:", professional)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())