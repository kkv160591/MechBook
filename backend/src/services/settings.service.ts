import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import { unmarshall } from "@aws-sdk/util-dynamodb"

import { db } from "../config/dynamodb"

const TABLE =
  process.env.SETTINGS_TABLE_NAME

const PLAN_DEFINITIONS: any = {

  FREE: {
    planName: "Free",
    monthlyJobs: 20,
    workers: 1,
    monthlyPrice: 0,
    annualPrice: 0
  },

  BASIC: {
    planName: "Basic",
    monthlyJobs: 100,
    workers: 3,
    monthlyPrice: 299,
    annualPrice: 199
  },

  GROWTH: {
    planName: "Growth",
    monthlyJobs: 250,
    workers: 6,
    monthlyPrice: 549,
    annualPrice: 399
  },

  CORPORATE: {
    planName: "Corporate",
    monthlyJobs: -1,
    workers: -1,
    monthlyPrice: 899,
    annualPrice: 629
  }

}

const BOOSTERS: any = {

  MINI: {
    name: "Mini Boost",
    jobs: 20,
    price: 49
  },

  STANDARD: {
    name: "Standard Boost",
    jobs: 50,
    price: 99
  },

  BIG: {
    name: "Big Boost",
    jobs: 150,
    price: 249
  }

}

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