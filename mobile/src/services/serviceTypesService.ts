import api from "./api"

export const getServiceTypes = async () => {
  const response = await api.get("/api/services")
  return response.data
}

export const getServiceTypeById = async (id: string) => {
  const response = await api.get(`/api/services/${id}`)
  return response.data
}

export const createServiceType = async (data: any) => {
  const response = await api.post("/api/services", data)
  return response.data
}

export const updateServiceType = async (
  id: string,
  data: any
) => {
  const response = await api.put(
    `/api/services/${id}`,
    data
  )

  return response.data
}

export const deleteServiceType = async (
  id: string
) => {
  const response = await api.delete(
    `/api/services/${id}`
  )

  return response.data
}