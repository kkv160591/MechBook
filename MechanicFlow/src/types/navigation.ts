export type Service = {
  id: string
  name: string
  estimatedPrice: number
  actualPrice?: number
}

export type Job = {
  id: string
  vehicle: string
  customer: string
  services: Service[]
  status: string
}

export type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  CreateJob: undefined
  BottomTabs: undefined
  Jobs: undefined
  JobDetail: { job: Job }
  Invoice: { job: Job }
  CustomerDetail: {
    customer: any
  }
  AddCustomer: undefined
  Inventory: undefined
}