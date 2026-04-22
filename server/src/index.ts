import express from "express"
import cors from "cors"
import path from "path"
import "./lib/loadEnv"
import authRoutes from "./routes/auth.routes"
import patientRoutes from "./routes/patient.routes"
import sessionRoutes from "./routes/session.routes"
import goalRoutes from "./routes/goal.routes"
import taskRoutes from "./routes/task.routes"
import fileRoutes from "./routes/file.routes"
import { startReminderCron } from "./utils/reminderCron"
import appointmentRoutes from "./routes/appointment.routes"

const app = express()
const PORT = Number(process.env.PORT || 3000)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error("Origen no permitido por CORS"))
  },
  credentials: true
}))

app.use(express.json())
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/patients", patientRoutes)
app.use("/api/v1/patients/:patientId/sessions", sessionRoutes)
app.use("/api/v1/patients/:patientId/goals", goalRoutes)
app.use("/api/v1/patients/:patientId/tasks", taskRoutes)
app.use("/api/v1/patients/:patientId/files", fileRoutes)
app.use("/api/v1/appointments", appointmentRoutes)

startReminderCron()

app.get("/api/v1/health", (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
