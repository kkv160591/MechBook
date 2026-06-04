import { api } from "./api";

export const createJob = async (job: any) => {
  const res = await api.post("/jobs", job);
  return res.data;
}

export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
}