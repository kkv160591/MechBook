import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import { unmarshall } from "@aws-sdk/util-dynamodb"

import { db } from "../config/dynamodb"

const TABLE =
  process.env.SETTINGS_TABLE_NAME

export const getSetting =
async (
  garageId: string,
  settingType: string
) => {

  const response =
    await db.send(
      new GetItemCommand({

        TableName: TABLE,

        Key: {
          garageId: {
            S: garageId
          },
          settingType: {
            S: settingType
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

export const saveSetting =
async (
  garageId: string,
  settingType: string,
  data: any
) => {

  const item: any = {

    garageId: {
      S: garageId
    },

    settingType: {
      S: settingType
    }

  }

  Object.entries(data)
    .forEach(([key, value]) => {

      if (typeof value === "string") {

        item[key] = {
          S: value
        }

      }

      else if (
        typeof value === "number"
      ) {

        item[key] = {
          N: value.toString()
        }

      }

      else if (
        typeof value === "boolean"
      ) {

        item[key] = {
          BOOL: value
        }

      }

    })

  await db.send(
    new PutItemCommand({

      TableName: TABLE,

      Item: item

    })
  )

  return {
    success: true
  }

}

export const runBackup =
async (
  garageId: string
) => {

  const lastBackup =
    new Date().toISOString()

  await db.send(
    new UpdateItemCommand({

      TableName: TABLE,

      Key: {
        garageId: {
          S: garageId
        },
        settingType: {
          S: "BACKUP"
        }
      },

      UpdateExpression:
        "SET lastBackup = :lastBackup",

      ExpressionAttributeValues: {

        ":lastBackup": {
          S: lastBackup
        }

      }

    })
  )

  return {
    lastBackup
  }

}