export interface SessionOperationalObjectiveInput {
  id?: string
  description: string
  activities?: string[]
  order: number
}

export interface SessionSpecificObjectiveInput {
  id?: string
  description: string
  order: number
  operationalObjectives: SessionOperationalObjectiveInput[]
}

export interface SessionTaskInput {
  id?: string
  title: string
  description?: string
  order: number
}

export interface SessionPlanInput {
  contentHierarchy: string[]
  hierarchyCriteria: string
  focus: string
  modality: string
  strategies: string
  generalObjective: string
  specificObjectives: SessionSpecificObjectiveInput[]
  sessionTasks: SessionTaskInput[]
}

export interface CreateSessionInput extends SessionPlanInput {
  date: string
  whatWasDone: string
}

export interface UpdateSessionInput extends Partial<CreateSessionInput> {}
