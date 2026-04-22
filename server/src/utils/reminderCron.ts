import cron from "node-cron"
import prisma from "../lib/prisma"
import { sendReminderEmail } from "./mailer"

export const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Revisando recordatorios pendientes...")

    try {
      const now = new Date()
      console.log("Hora actual:", now)

      const reminders = await prisma.appointmentReminder.findMany({
        where: {
          sentAt: null,
          scheduledAt: {
            lte: now
          },
          appointment: {
            datetime: {
              gte: now
            }
          }
        },
        include: {
          appointment: {
            include: {
              patient: true
            }
          }
        }
      })

      console.log("Recordatorios encontrados:", reminders.length)

      for (const reminder of reminders) {
        const { appointment } = reminder

        console.log("Procesando recordatorio:", reminder.id, "email paciente:", appointment.patient.email)
        if (!appointment.patient.email) continue

        try {
          await sendReminderEmail(
            appointment.patient.email,
            appointment.patient.name,
            appointment.datetime
          )

          await prisma.appointmentReminder.update({
            where: { id: reminder.id },
            data: { sentAt: now }
          })

          console.log(`Recordatorio enviado a ${appointment.patient.email}`)
        } catch (err) {
          console.error("Error enviando recordatorio:", err)
        }
      }
    } catch (err) {
      console.error("Error en cron job:", err)
    }
  })

  console.log("Cron job de recordatorios iniciado")
}
