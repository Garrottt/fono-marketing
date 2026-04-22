export interface CreateGoalInput {
  description: string
  startDate: string
  endDate: string
}

export interface CreateOperationalGoalInput {
  description: string
  order: number
}

export interface UpdateOperationalGoalInput {
  description?: string
  completed?: boolean
  status?: string
  notes?: string
  order?: number
}