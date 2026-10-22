// settingsService.ts
import api from "./api"

// FETCH ALL SETTINGS IN ONE CALL
export const getAllSettings = async () => {
  const response = await api.get("/api/settings")
  return response.data
}

export const updateGSTSettings = async (data: any) => {
  const response = await api.put("/api/settings/gst", data)
  return response.data
}

export const updateInvoiceSettings = async (data: any) => {
  const response = await api.put("/api/settings/invoice", data)
  return response.data
}

export const updateLanguageSettings = async (data: any) => {
  const response = await api.put("/api/settings/language", data)
  return response.data
}

export const getBackupSettings = async () => {
  const response = await api.get("/api/settings/backup")
  return response.data
}

export const runBackup = async () => {
  const response = await api.post("/api/settings/backup/run")
  return response.data
}

export const getNotificationSettings = async () => {
  const response = await api.get("/api/settings/notifications")
  return response.data
}

export const updateNotificationSettings = async (data: any) => {
  const response = await api.put("/api/settings/notifications", data)
  return response.data
}