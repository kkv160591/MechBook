import {
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import {
  unmarshall,
  marshall
} from "@aws-sdk/util-dynamodb"

import { v4 as uuid } from "uuid"

import { db } from "../config/dynamodb"

export const createJob =
async (
  garageId: string,
  data: any
) => {

  const jobId = uuid()

  const now = new Date().toISOString()

  const item = {

    jobId,

    garageId,

    // Customer
    customerName: data.customerName || "",
    phone: data.phone || "",
    customerAddress: data.customerAddress || "",

    // Vehicle
    vehicleNumber: data.vehicleNumber || "",
    vehicleBrand: data.vehicleBrand || "",
    vehicleModel: data.vehicleModel || "",
    vehicleType: data.vehicleType || "2 Wheeler",
    odometer: data.odometer || "",

    // Job
    status: "pending",
    workerId: data.workerId || null,
    priority: data.priority || "Normal",
    deliveryDate: data.deliveryDate || "",

    // Complaint
    complaint: data.complaint || "",

    // Inspection
    inspectionNotes: data.inspectionNotes || "",

    // Payment
    paymentStatus: data.paymentStatus || "Pending",
    paymentMethod: data.paymentMethod || "",

    // Notes
    notes: data.notes || "",

    // Services
    services: data.services || [],

    createdAt: now,
    updatedAt: now
  }

  await db.send(
    new PutItemCommand({

      TableName:
        process.env.JOBS_TABLE_NAME,

      Item: marshall(item, {
        removeUndefinedValues: true
      })

    })
  )

  return item
}

export const getJobs =
async (
  garageId: string
) => {

  const response =
    await db.send(

      new ScanCommand({

        TableName:
          process.env.JOBS_TABLE_NAME

      })

    )

  const jobs =
    (response.Items || [])
      .map(item =>
        unmarshall(item)
      )
      .filter(
        (job: any) =>
          job.garageId === garageId
      )
      .sort(

        (a: any, b: any) =>

          new Date(b.createdAt).getTime() -

          new Date(a.createdAt).getTime()

      )

  return jobs

}

export const getJobById =
async (
  jobId: string
) => {

  const response =
    await db.send(

      new GetItemCommand({

        TableName:
          process.env.JOBS_TABLE_NAME,

        Key: {

          jobId: {

            S: jobId

          }

        }

      })

    )

  if (!response.Item) {

    return null

  }

  return unmarshall(
    response.Item
  )

}

export const updateJob =
async (
  jobId: string,
  data: any
) => {

  const existing =
    await getJobById(jobId)

  if (!existing) {

    return null

  }

  const updated = {

    ...existing,

    ...data,

    updatedAt:
      new Date().toISOString()

  }

  await db.send(

    new PutItemCommand({

      TableName:
        process.env.JOBS_TABLE_NAME,

      Item: marshall(updated, {
        removeUndefinedValues: true
      })

    })

  )

  return updated

}

export const assignWorker =
async (
  jobId: string,
  workerId: string
) => {

  await db.send(

    new UpdateItemCommand({

      TableName:
        process.env.JOBS_TABLE_NAME,

      Key: {

        jobId: {

          S: jobId

        }

      },

      UpdateExpression:

        "SET workerId = :workerId, updatedAt = :updatedAt",

      ExpressionAttributeValues: {

        ":workerId": {

          S: workerId

        },

        ":updatedAt": {

          S: new Date().toISOString()

        }

      }

    })

  )

}

export const updateJobStatus =
async (
  jobId: string,
  status: string
) => {

  await db.send(

    new UpdateItemCommand({

      TableName:
        process.env.JOBS_TABLE_NAME,

      Key: {

        jobId: {

          S: jobId

        }

      },

      UpdateExpression:

        "SET #status = :status, updatedAt = :updatedAt",

      ExpressionAttributeNames: {

        "#status": "status"

      },

      ExpressionAttributeValues: {

        ":status": {

          S: status

        },

        ":updatedAt": {

          S: new Date().toISOString()

        }

      }

    })

  )

}

export const deleteJob =
async (
  jobId: string
) => {

  await db.send(

    new UpdateItemCommand({

      TableName:
        process.env.JOBS_TABLE_NAME,

      Key: {

        jobId: {

          S: jobId

        }

      },

      UpdateExpression:

        "SET deleted = :deleted",

      ExpressionAttributeValues: {

        ":deleted": {

          BOOL: true

        }

      }

    })

  )

}