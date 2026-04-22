export interface CreatePatientInput {
  name: string
  age?: number
  email?: string
  phone?: string
  diagnosis?: string
  generalObjective?: string
  contentHierarchy?: string[]
  hierarchyCriteria?: string
  focus?: string
  modality?: string
  strategies?: string
}

export interface UpdatePatientInput {
  name?: string
  age?: number
  email?: string
  phone?: string
  diagnosis?: string
  generalObjective?: string
  contentHierarchy?: string[]
  hierarchyCriteria?: string
  focus?: string
  modality?: string
  strategies?: string
  active?: boolean
}

export interface PortalAccessInput {
  email: string
  password: string
}
