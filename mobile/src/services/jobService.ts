import api from "./api"


// ==================================
// GET ALL JOBS
// ==================================

export const getJobs =
async () => {

  const response =
    await api.get(
      "/jobs"
    )

  return response.data

}


// ==================================
// GET JOB BY ID
// ==================================

export const getJobById =
async (
  jobId: string
) => {

  const response =
    await api.get(
      `/jobs/${jobId}`
    )

  return response.data

}


// ==================================
// CREATE JOB
// ==================================

export const createJob =
async (
  data: any
) => {

  try {

    const response =
      await api.post(
        "/jobs",
        data
      )

    return response.data

  }

  catch (error: any) {

    /*
     * IMPORTANT:
     *
     * We intentionally re-throw the
     * original Axios error.
     *
     * AddJobScreen uses:
     *
     * error.response.status
     *
     * to detect a backend 403 when
     * the garage has reached its
     * plan job limit.
     */

    console.log(
      "createJob API error:",
      error?.response?.data ||
      error?.message ||
      error
    )

    throw error

  }

}


// ==================================
// UPDATE JOB
// ==================================

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


// ==================================
// UPDATE JOB STATUS
// ==================================

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


// ==================================
// ASSIGN WORKER
// ==================================

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


// ==================================
// DELETE JOB
// ==================================

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