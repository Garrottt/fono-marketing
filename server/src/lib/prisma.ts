import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "./loadEnv"

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL as string 
})

const prisma = new PrismaClient({ adapter })

export default prisma
