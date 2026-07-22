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
  WorkerDashboard: undefined
  CreateJob: undefined
  EditJobScreen: undefined
  BottomTabs: undefined
  Jobs: undefined
  JobDetail: { job: Job }
  Invoice: { job: Job }
  CustomerDetail: {
    customer: any
  }
  AddCustomer: undefined
  Inventory: undefined
  Settings: undefined
  GarageProfile: undefined
  Workers: undefined
  ServiceTypes: undefined
  GSTConfig: undefined
  InvoiceSettings: undefined
  Backup: undefined
  PlanUsage: undefined
  Language: undefined
  WorkerAccounts: undefined
  WorkerDetails: undefined
  LoginHistory: undefined
  AddWorker: undefined
  AddServiceType: undefined
  EditServiceType: undefined
  Register: undefined
}