import {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb"

import {
  unmarshall
} from "@aws-sdk/util-dynamodb"

import { v4 as uuid } from "uuid"

import { db } from "../config/dynamodb"

export const createServiceType =
async (
  garageId: string,
  data: any
) => {

  const serviceTypeId = uuid()

  await db.send(
    new PutItemCommand({

      TableName:
        process.env.SERVICE_TYPES_TABLE_NAME,

      Item: {

        serviceTypeId: {
          S: serviceTypeId
        },

        garageId: {
          S: garageId
        },

        name: {
          S: data.name
        },

        category: {
          S: data.category
        },

        defaultPrice: {
          N: String(
            data.defaultPrice || 0
          )
        },

        estimatedDuration: {
          S:
            data.estimatedDuration || ""
        },

        active: {
          BOOL: true
        },

        createdAt: {
          S: new Date().toISOString()
        }

      }

    })
  )

  return {
    serviceTypeId
  }

}

export const getServiceTypes =
async (
  garageId: string
) => {

  const response =
    await db.send(
      new ScanCommand({

        TableName:
          process.env.SERVICE_TYPES_TABLE_NAME

      })
    )

  return (
    response.Items || []
  )
    .map(item =>
      unmarshall(item)
    )
    .filter(
      (service: any) =>
        service.garageId === garageId
    )

}

export const getServiceTypeById =
async (
  serviceTypeId: string
) => {

  const response =
    await db.send(
      new GetItemCommand({

        TableName:
          process.env.SERVICE_TYPES_TABLE_NAME,

        Key: {
          serviceTypeId: {
            S: serviceTypeId
          }
        }

      })
    )

  if (!response.Item)
    return null

  return unmarshall(
    response.Item
  )

}

export const updateServiceType =
async (
  serviceTypeId: string,
  data: any
) => {

  await db.send(
    new UpdateItemCommand({

      TableName:
        process.env.SERVICE_TYPES_TABLE_NAME,

      Key: {
        serviceTypeId: {
          S: serviceTypeId
        }
      },

      UpdateExpression: `
      SET
      #name = :name,
      category = :category,
      defaultPrice = :defaultPrice,
      estimatedDuration = :estimatedDuration
      `,

      ExpressionAttributeNames: {
        "#name": "name"
      },

      ExpressionAttributeValues: {

        ":name": {
          S: data.name
        },

        ":category": {
          S: data.category
        },

        ":defaultPrice": {
          N: String(
            data.defaultPrice
          )
        },

        ":estimatedDuration": {
          S:
            data.estimatedDuration
        }

      }

    })
  )

  return getServiceTypeById(
    serviceTypeId
  )

}

export const deleteServiceType =
async (
  serviceTypeId: string
) => {

  await db.send(
    new DeleteItemCommand({

      TableName:
        process.env.SERVICE_TYPES_TABLE_NAME,

      Key: {
        serviceTypeId: {
          S: serviceTypeId
        }
      }

    })
  )

}