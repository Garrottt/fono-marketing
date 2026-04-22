import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const newPassword = process.env.ADMIN_PASSWORD

async function main() {
  if (!email || !newPassword) {
    throw new Error("Debes definir ADMIN_EMAIL y ADMIN_PASSWORD.")
  }

  if (newPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.")
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  const professional = await prisma.professional.update({
    where: { email },
    data: { passwordHash }
  })

  console.log("Password profesional actualizado:", professional.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
