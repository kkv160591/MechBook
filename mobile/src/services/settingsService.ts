import api from "./api"

export const getGSTSettings =
async () => {

  const response =
    await api.get(
      "/api/settings/gst"
    )

  return response.data

}

export const updateGSTSettings =
async (data: any) => {

  const response =
    await api.put(
      "/api/settings/gst",
      data
    )

  return response.data

}

export const getInvoiceSettings =
async () => {

  const response =
    await api.get(
      "/api/settings/invoice"
    )

  return response.data

}

export const updateInvoiceSettings =
async (data: any) => {

  const response =
    await api.put(
      "/api/settings/invoice",
      data
    )

  return response.data

}

export const getLanguageSettings =
async () => {

  const response =
    await api.get(
      "/api/settings/language"
    )

  return response.data

}

export const updateLanguageSettings =
async (data: any) => {

  const response =
    await api.put(
      "/api/settings/language",
      data
    )

  return response.data

}

export const getBackupSettings =
async () => {

  const response =
    await api.get(
      "/api/settings/backup"
    )

  return response.data

}

export const runBackup =
async () => {

  const response =
    await api.post(
      "/api/settings/backup/run"
    )

  return response.data

}

export const getPlanDetails =
async () => {

  const response =
    await api.get(
      "/api/settings/plan"
    )

  return response.data

}