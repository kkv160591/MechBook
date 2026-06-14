import api from "./api"

export const getGarageProfile =
async () => {

  const response =
    await api.get(
      "/api/garage/profile"
    )

  return response.data

}

export const updateGarageProfile =
async (data: any) => {

  const response =
    await api.put(
      "/api/garage/profile",
      data
    )

  return response.data

}