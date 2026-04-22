import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import "../lib/loadEnv"
import { CHILE_TIMEZONE } from "./timezone"

const brevoApiKey = process.env.BREVO_API_KEY
const smtpHost = process.env.SMTP_HOST || "smtp-relay.brevo.com"
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpSecure = process.env.SMTP_SECURE === "true"
const smtpRequireTls = process.env.SMTP_REQUIRE_TLS !== "false"
const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER
const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS
const emailFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || emailUser
const emailFromName = process.env.MAIL_FROM_NAME || "Fono App"

const transportConfig = {
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpRequireTls,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  family: 4,
  auth: {
    user: emailUser,
    pass: emailPass
  }
} as SMTPTransport.Options & { family: 4 }

const transporter = nodemailer.createTransport(transportConfig)

const sendMailWithLogging = async (options: nodemailer.SendMailOptions) => {
  if (!emailFrom) {
    throw new Error("EMAIL_CONFIG_MISSING")
  }

  if (brevoApiKey) {
    console.log("Intentando enviar correo con API de Brevo")

    const recipients = [options.to]
      .flat()
      .filter(Boolean)
      .map((value) => {
        if (typeof value === "string") {
          return { email: value }
        }

        const recipient = value as { address: string; name?: string }
        return { email: recipient.address, name: recipient.name }
      })

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          email: emailFrom,
          name: emailFromName
        },
        to: recipients,
        subject: options.subject,
        htmlContent: options.html
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`BREVO_API_ERROR ${response.status}: ${errorBody}`)
    }

    const data = await response.json() as { messageId?: string }
    console.log("Correo enviado:", {
      to: options.to,
      subject: options.subject,
      messageId: data.messageId
    })

    return data
  }

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_CONFIG_MISSING")
  }

  console.log("Intentando enviar correo con transporte SMTP:", {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: smtpRequireTls
  })

  const info = await transporter.sendMail({
    ...options,
    from: emailFrom
  })

  console.log("Correo enviado:", {
    to: options.to,
    subject: options.subject,
    messageId: info.messageId
  })

  return info
}

const getDateParts = (datetime: Date) => {
  const dateStr = datetime.toLocaleDateString("es-CL", {
    timeZone: CHILE_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const timeStr = datetime.toLocaleTimeString("es-CL", {
    timeZone: CHILE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })

  return { dateStr, timeStr }
}

export const sendReminderEmail = async (
  to: string,
  patientName: string,
  datetime: Date
) => {
  const { dateStr, timeStr } = getDateParts(datetime)

  await sendMailWithLogging({
    to,
    subject: "Recordatorio de cita fonoaudiologica",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Recordatorio de cita</h2>
        <p>Hola <strong>${patientName}</strong>,</p>
        <p>Te recordamos que tenes una cita programada para:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px;"><strong>${dateStr}</strong></p>
          <p style="margin: 4px 0 0; color: #666;">${timeStr} hs</p>
        </div>
        <p>Por favor confirma tu asistencia o avisa con anticipacion si no podes asistir.</p>
        <p style="color: #999; font-size: 12px;">Este es un mensaje automatico, no respondas este email.</p>
      </div>
    `
  })
}

export const sendAppointmentCreatedEmail = async (
  to: string,
  patientName: string,
  datetime: Date
) => {
  const { dateStr, timeStr } = getDateParts(datetime)

  await sendMailWithLogging({
    to,
    subject: "Cita fonoaudiologica agendada",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Cita agendada</h2>
        <p>Hola <strong>${patientName}</strong>,</p>
        <p>Tu cita fue registrada correctamente para:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px;"><strong>${dateStr}</strong></p>
          <p style="margin: 4px 0 0; color: #666;">${timeStr} hs</p>
        </div>
        <p>Te enviaremos otros correos a modo de recordatorio en los horarios programados.</p>
        <p style="color: #999; font-size: 12px;">Este es un mensaje automatico, no respondas este email.</p>
      </div>
    `
  })
}

export const sendAppointmentRescheduledEmail = async (
  to: string,
  patientName: string,
  datetime: Date
) => {
  const { dateStr, timeStr } = getDateParts(datetime)

  await sendMailWithLogging({
    to,
    subject: "Tu cita fue reagendada",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Cita reagendada</h2>
        <p>Hola <strong>${patientName}</strong>,</p>
        <p>Tu cita fue reagendada. La nueva fecha y hora es:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px;"><strong>${dateStr}</strong></p>
          <p style="margin: 4px 0 0; color: #666;">${timeStr} hs</p>
        </div>
        <p>Si tienes dudas o necesitas otro cambio, por favor comunicate con la profesional.</p>
        <p style="color: #999; font-size: 12px;">Este es un mensaje automatico, no respondas este email.</p>
      </div>
    `
  })
}

export const sendPatientPortalAccessEmail = async (
  to: string,
  patientName: string,
  temporaryPassword: string,
  passwordSetupUrl: string,
  expiresAt: Date
) => {
  const expiry = expiresAt.toLocaleString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: CHILE_TIMEZONE
  })

  await sendMailWithLogging({
    to,
    subject: "Acceso al portal del paciente",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Tu acceso al portal ya está listo</h2>
        <p>Hola <strong>${patientName}</strong>,</p>
        <p>Se creó tu acceso al portal del paciente.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 0;"><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
        </div>
        <p>Por seguridad, te pedimos cambiar esta contraseña en tu primer ingreso desde el siguiente enlace:</p>
        <p style="margin: 20px 0;">
          <a href="${passwordSetupUrl}" style="background: #4f46e5; color: white; text-decoration: none; padding: 12px 18px; border-radius: 8px; display: inline-block;">
            Cambiar contraseña
          </a>
        </p>
        <p>Este enlace vence el <strong>${expiry}</strong>.</p>
        <p style="color: #999; font-size: 12px;">Este es un mensaje automático, no respondas este email.</p>
      </div>
    `
  })
}
