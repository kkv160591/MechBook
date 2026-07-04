import api from "./api"

export const getJobs =
async () => {

  const response =
    await api.get("/jobs")

  return response.data

}

export const getJobById =
async (
  jobId: string
) => {

  const response =
    await api.get(`/jobs/${jobId}`)

  return response.data

}

export const createJob =
async (
  data: any
) => {

  const response =
    await api.post(
      "/jobs",
      data
    )

  return response.data

}

export const updateJob =
async (
  jobId: string,
  data: any
) => {

  const response =
    await api.put(
      `/jobs/${jobId}`,
      data
    )

  return response.data

}

export const updateJobStatus =
async (
  jobId: string,
  status: string
) => {

  const response =
    await api.patch(
      `/jobs/${jobId}/status`,
      {
        status
      }
    )

  return response.data

}

export const assignWorker =
async (
  jobId: string,
  workerId: string
) => {

  const response =
    await api.patch(
      `/jobs/${jobId}/worker`,
      {
        workerId
      }
    )

  return response.data

}

export const deleteJob =
async (
  jobId: string
) => {

  const response =
    await api.delete(
      `/jobs/${jobId}`
    )

  return response.data

}