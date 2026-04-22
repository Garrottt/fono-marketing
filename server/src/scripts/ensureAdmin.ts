import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

const name = process.env.ADMIN_NAME?.trim()
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

async function main() {
  if (!name || !email || !password) {
    throw new Error("Debes definir ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD.")
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const professional = await prisma.professional.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: "PROFESSIONAL"
    },
    create: {
      name,
      email,
      passwordHash,
      role: "PROFESSIONAL"
    }
  })

  console.log("Cuenta profesional lista:", professional.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
