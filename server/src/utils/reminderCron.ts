import cron from "node-cron"
import prisma from "../lib/prisma"
import { sendReminderEmail } from "./mailer"

export const processDueReminders = async () => {
  console.log("Revisando recordatorios pendientes...")

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

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const reminder of reminders) {
    const { appointment } = reminder

    console.log("Procesando recordatorio:", reminder.id, "email paciente:", appointment.patient.email)

    if (!appointment.patient.email) {
      skipped += 1
      continue
    }

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

      sent += 1
      console.log(`Recordatorio enviado a ${appointment.patient.email}`)
    } catch (err) {
      failed += 1
      console.error("Error enviando recordatorio:", err)
    }
  }

  return {
    processed: reminders.length,
    sent,
    skipped,
    failed,
    ranAt: now.toISOString()
  }
}

export const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await processDueReminders()
    } catch (err) {
      console.error("Error en cron job:", err)
    }
  })

  console.log("Cron job de recordatorios iniciado")
}
