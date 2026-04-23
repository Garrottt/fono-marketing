import fs from "fs"
import os from "os"
import path from "path"

const isVercel = Boolean(process.env.VERCEL)
const baseUploadDir = isVercel ? path.join(os.tmpdir(), "fono-marketing-uploads") : path.join(process.cwd(), "uploads")

export const uploadDir = baseUploadDir

export const ensureUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

export const buildUploadUrl = (filename: string) => `/uploads/${filename}`

export const getUploadPathFromUrl = (url: string) => {
  const filename = path.basename(url)
  return path.join(uploadDir, filename)
}
