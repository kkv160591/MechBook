import api from "./api"

export const getWorkers = async () => {

  const response =
    await api.get("/api/workers")

  return response.data

}

export const getWorkerById = async (
  workerId: string
) => {

  const response =
    await api.get(
      `/api/workers/${workerId}`
    )

  return response.data

}

export const createWorker = async (
  worker: any
) => {

  const response =
    await api.post(
      "/api/workers",
      worker
    )

  return response.data

}

export const updateWorker = async (
  workerId: string,
  worker: any
) => {

  const response =
    await api.put(
      `/api/workers/${workerId}`,
      worker
    )

  return response.data

}

export const resetWorkerPin = async (
  workerId: string,
  pin: string
) => {

  const response =
    await api.patch(
      `/api/workers/${workerId}/reset-pin`,
      { pin }
    )

  return response.data

}

export const updateWorkerStatus =
async (
  workerId: string,
  active: boolean
) => {

  const response =
    await api.patch(
      `/api/workers/${workerId}/status`,
      { active }
    )

  return response.data

}