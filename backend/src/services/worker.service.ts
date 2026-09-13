import {
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import {
  unmarshall
} from "@aws-sdk/util-dynamodb"

import bcrypt from "bcryptjs"

import {
  v4 as uuid
} from "uuid"

import {
  db
} from "../config/dynamodb"


export const createWorker =
  async (
    garageId: string,
    data: any
  ) => {

    const workerId = uuid()

    const pinHash =
      await bcrypt.hash(
        data.pin,
        10
      )

    await db.send(
      new PutItemCommand({

        TableName:
          process.env.WORKERS_TABLE_NAME,

        Item: {

          /*
           * Universal authenticated identity.
           *
           * For now:
           * userId === workerId
           */
          userId: {
            S: workerId
          },

          workerId: {
            S: workerId
          },

          garageId: {
            S: garageId
          },

          name: {
            S: data.name
          },

          /*
           * "role" is kept for compatibility
           * with your existing Workers table.
           *
           * Authentication will expose this
           * as jobRole.
           */
          role: {
            S: data.role
          },

          phone: {
            S: data.phone
          },

          pinHash: {
            S: pinHash
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
      userId: workerId,
      workerId
    }
  }


export const getWorkers =
  async (
    garageId: string
  ) => {

    const response =
      await db.send(
        new ScanCommand({

          TableName:
            process.env.WORKERS_TABLE_NAME
        })
      )

    const workers =
      (response.Items || [])
        .map(item =>
          unmarshall(item)
        )
        .filter(
          (worker: any) =>
            worker.garageId === garageId
        )
        .map(
          (worker: any) => {

            /*
             * Do not expose authentication
             * secrets to the mobile app.
             */
            const {
              pinHash,
              ...safeWorker
            } = worker

            return {
              ...safeWorker,

              /*
               * Backward compatibility for
               * workers created before this change.
               */
              userId:
                safeWorker.userId ||
                safeWorker.workerId
            }
          }
        )

    return workers
  }


export const getWorkerById =
  async (
    workerId: string
  ) => {

    const response =
      await db.send(
        new GetItemCommand({

          TableName:
            process.env.WORKERS_TABLE_NAME,

          Key: {
            workerId: {
              S: workerId
            }
          }
        })
      )

    if (!response.Item) {
      return null
    }

    const worker =
      unmarshall(
        response.Item
      )

    /*
     * Never return pinHash.
     */
    const {
      pinHash,
      ...safeWorker
    } = worker

    return {
      ...safeWorker,

      userId:
        safeWorker.userId ||
        safeWorker.workerId
    }
  }


export const updateWorker =
  async (
    workerId: string,
    data: any
  ) => {

    await db.send(
      new UpdateItemCommand({

        TableName:
          process.env.WORKERS_TABLE_NAME,

        Key: {
          workerId: {
            S: workerId
          }
        },

        UpdateExpression: `
        SET
        #name = :name,
        #role = :role,
        phone = :phone
        `,

        ExpressionAttributeNames: {

          "#name": "name",

          "#role": "role"
        },

        ExpressionAttributeValues: {

          ":name": {
            S: data.name
          },

          ":role": {
            S: data.role
          },

          ":phone": {
            S: data.phone
          }
        }
      })
    )

    return getWorkerById(
      workerId
    )
  }


export const updateWorkerStatus =
  async (
    workerId: string,
    active: boolean
  ) => {

    await db.send(
      new UpdateItemCommand({

        TableName:
          process.env.WORKERS_TABLE_NAME,

        Key: {
          workerId: {
            S: workerId
          }
        },

        UpdateExpression:
          "SET active = :active",

        ExpressionAttributeValues: {

          ":active": {
            BOOL: active
          }
        }
      })
    )
  }


export const resetWorkerPin =
  async (
    workerId: string,
    pin: string
  ) => {

    const pinHash =
      await bcrypt.hash(
        pin,
        10
      )

    await db.send(
      new UpdateItemCommand({

        TableName:
          process.env.WORKERS_TABLE_NAME,

        Key: {
          workerId: {
            S: workerId
          }
        },

        UpdateExpression:
          "SET pinHash = :pinHash",

        ExpressionAttributeValues: {

          ":pinHash": {
            S: pinHash
          }
        }
      })
    )
  }