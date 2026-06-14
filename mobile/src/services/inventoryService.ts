import api from "./api"

export const getInventory = async () => {
  const response = await api.get("/api/inventory")
  return response.data
}

export const getInventoryById = async (
  inventoryId: string
) => {
  const response = await api.get(
    `/api/inventory/${inventoryId}`
  )

  return response.data
}

export const createInventory = async (
  data: any
) => {
  const response = await api.post(
    "/api/inventory",
    data
  )

  return response.data
}

export const updateInventory = async (
  inventoryId: string,
  data: any
) => {
  const response = await api.put(
    `/api/inventory/${inventoryId}`,
    data
  )

  return response.data
}

export const getLowStockItems =
  async () => {

    const response =
      await api.get(
        "/api/inventory/low-stock"
      )

    return response.data
  }