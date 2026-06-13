import {
  PutCommand,
  ScanCommand,
  GetCommand
} from "@aws-sdk/lib-dynamodb"

import { db } from "../config/dynamodb"

import { v4 as uuidv4 } from "uuid"

export const createCustomer =
  async (
    garageId: string,
    data: any
  ) => {

    const customer = {

      customerId: uuidv4(),

      garageId,

      name: data.name,
      phone: data.phone,

      alternatePhone:
        data.alternatePhone || "",

      address:
        data.address || "",

      notes:
        data.notes || "",

      totalVehicles: 0,
      totalJobs: 0,
      totalSpent: 0,
      pendingAmount: 0,

      createdAt:
        new Date().toISOString()

    }

    await db.send(

      new PutCommand({

        TableName: "Customers",

        Item: customer

      })

    )

    return customer

  }

export const getCustomers =
  async (garageId: string) => {

    const result =
      await db.send(

        new ScanCommand({

          TableName: "Customers",

          FilterExpression:
            "garageId = :garageId",

          ExpressionAttributeValues: {

            ":garageId": garageId

          }

        })

      )

    return result.Items || []

  }

export const getCustomerById =
  async (
    customerId: string
  ) => {

    const result =
      await db.send(

        new GetCommand({

          TableName: "Customers",

          Key: {

            customerId

          }

        })

      )

    return result.Item

  }