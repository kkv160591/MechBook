import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import {
  marshall,
  unmarshall
} from "@aws-sdk/util-dynamodb"

import {
  db
} from "../config/dynamodb"


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


/**
 * Get complete garage setting.
 */
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


/**
 * Save a complete setting.
 *
 * Supports:
 * - string
 * - number
 * - boolean
 * - arrays
 * - nested objects
 */
export const saveSetting =
  async (
    garageId: string,
    settingType: string,
    data: any
  ) => {

    const item = {

      garageId,

      settingType,

      ...data
    }

    await db.send(
      new PutItemCommand({

        TableName: TABLE,

        Item: marshall(
          item,
          {
            removeUndefinedValues: true
          }
        )
      })
    )

    return {
      success: true,
      setting: item
    }
  }


/**
 * Update the current user's language
 * and other user-level preferences.
 *
 * IMPORTANT:
 * userId comes from authenticated req.user.
 */
export const updateUserLanguageSetting =
  async (
    garageId: string,
    userId: string,
    data: any
  ) => {

    const existing =
      await getSetting(
        garageId,
        "LANGUAGE"
      )

    const existingUsers =
      Array.isArray(existing?.users)
        ? existing.users
        : []

    /*
     * Make a copy so we never mutate
     * the object returned from DynamoDB.
     */
    const users =
      [...existingUsers]

    const index =
      users.findIndex(
        (item: any) =>
          item?.userId === userId
      )

    const currentUserSettings =
      index >= 0
        ? users[index]
        : {
            userId
          }

    const updatedUserSettings = {

      ...currentUserSettings,

      userId,

      ...data
    }

    if (index >= 0) {

      users[index] =
        updatedUserSettings

    } else {

      users.push(
        updatedUserSettings
      )
    }

    const setting = {

      garageId,

      settingType:
        "LANGUAGE",

      users
    }

    await db.send(
      new PutItemCommand({

        TableName: TABLE,

        Item: marshall(
          setting,
          {
            removeUndefinedValues: true
          }
        )
      })
    )

    return setting
  }


/**
 * Get ONLY the current user's language/preferences.
 *
 * The database can contain all users,
 * but the API doesn't need to expose
 * everyone else's preferences.
 */
export const getUserLanguageSetting =
  async (
    garageId: string,
    userId: string
  ) => {

    const setting =
      await getSetting(
        garageId,
        "LANGUAGE"
      )

    if (!setting) {

      return {

        settingType:
          "LANGUAGE",

        garageId,

        userId,

        language: "en"
      }
    }

    const userSettings =
      Array.isArray(setting.users)
        ? setting.users.find(
            (item: any) =>
              item?.userId === userId
          )
        : null

    return {

      settingType:
        "LANGUAGE",

      garageId,

      userId,

      language:
        userSettings?.language ||
        "en",

      /*
       * Future user-level settings
       * are returned too.
       */
      ...userSettings
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