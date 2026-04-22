export interface CreateTaskInput {
  title: string
  description?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  seen?: boolean
}