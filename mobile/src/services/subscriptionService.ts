import api from "./api"


export const getPlanUsage =
async () => {

  const response =
    await api.get(
      "/api/subscription"
    )

  return response.data

}


export const changePlan =
async (
  planCode: string,
  billingCycle:
    "MONTHLY" |
    "ANNUAL"
) => {

  const response =
    await api.post(
      "/api/subscription/change-plan",
      {
        planCode,
        billingCycle
      }
    )

  return response.data

}


export const buyBooster =
async (
  boosterCode: string
) => {

  const response =
    await api.post(
      "/api/subscription/booster",
      {
        boosterCode
      }
    )

  return response.data

}