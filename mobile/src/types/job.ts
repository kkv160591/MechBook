export type JobStatus =
  | "active"
  | "progress"
  | "completed"

export type Service = {
  id: number
  name: string
  estimatedPrice: number
  actualPrice?: number
}

export type Job = {
  id: number
  vehicle: string
  customer: string
  status: "active" | "progress" | "completed"
  services: Service[]
  total: number
}