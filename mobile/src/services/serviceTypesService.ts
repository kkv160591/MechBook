import api from "./api"

export const getServiceTypes =
() =>
  api.get("/api/services")

export const getServiceTypeById =
(id: string) =>
  api.get(`/api/services/${id}`)

export const createServiceType =
(data: any) =>
  api.post(
    "/api/services",
    data
  )

export const updateServiceType =
(
  id: string,
  data: any
) =>
  api.put(
    `/api/services/${id}`,
    data
  )

export const deleteServiceType =
(id: string) =>
  api.delete(
    `/api/services/${id}`
  )