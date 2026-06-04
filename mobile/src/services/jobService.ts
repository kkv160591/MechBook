import { Job } from "../types/job"

export const getJobs = async (): Promise<Job[]> => {

  return [
    {
      id: "1",
      vehicle: "MH12AB1234",
      customer: "Rahul Sharma",
      phone: "9876543210",
      services: [
        {
          id: "s1",
          name: "Oil Change",
          estimatedPrice: 1200
        }
      ],
      status: "active",
      createdAt: "2024-01-01"
    },
    {
      id: "2",
      vehicle: "MH14XY9876",
      customer: "Amit Patil",
      phone: "9876543222",
      services: [
        {
          id: "s2",
          name: "Full Service",
          estimatedPrice: 4500
        },
        {
          id: "s3",
          name: "Brake Pads",
          estimatedPrice: 2000
        }
      ],
      status: "progress",
      createdAt: "2024-01-02"
    }
  ]

}