export interface CreateAppointmentInput {
  patientId: string
  datetime: string
  notes?: string
  reminderScheduledAts?: string[]
}

export interface UpdateAppointmentInput {
  datetime?: string
  notes?: string
  status?: string
  reminderScheduledAts?: string[]
}
