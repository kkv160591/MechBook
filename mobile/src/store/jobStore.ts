import { useState, useEffect } from "react"
import { Job } from "../types/job"
import { getJobs } from "../services/jobService"

export const useJobStore = () => {

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)

  const loadJobs = async () => {

    setLoading(true)

    const data = await getJobs()

    setJobs(data)

    setLoading(false)

  }

  useEffect(() => {
    loadJobs()
  }, [])

  return {
    jobs,
    loading,
    loadJobs
  }

}