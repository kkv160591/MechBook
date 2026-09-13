import {
  PutCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb"

import {
  db
} from "../config/dynamodb"

import {
  v4 as uuidv4
} from "uuid"

import bcrypt from "bcryptjs"

import {
  generateToken
} from "../utils/jwt"


/*
 * --------------------------------------------------
 * REGISTER GARAGE
 * --------------------------------------------------
 */

export const registerGarage =
  async (
    data: any
  ) => {

    const {
      garageName,
      ownerName,
      phone,
      pin,
      city,
      state,
      country,
      address,
      logo
    } = data

    const existingGarage =
      await db.send(
        new ScanCommand({

          TableName:
            "Garages",

          FilterExpression:
            "phone = :phone",

          ExpressionAttributeValues: {
            ":phone":
              phone
          }
        })
      )

    if (
      existingGarage.Items &&
      existingGarage.Items.length > 0
    ) {
      throw new Error(
        "Phone number already registered"
      )
    }

    const pinHash =
      await bcrypt.hash(
        pin,
        10
      )

    const garageId =
      uuidv4()

    const garage = {

      garageId,

      userId:
        garageId,

      userType:
        "owner",

      garageName,

      ownerName,

      phone,

      pinHash,

      role:
        "owner",

      city,

      state,

      country,

      address,

      logo:
        logo || "",

      isActive:
        true,

      createdAt:
        new Date().toISOString()
    }

    await db.send(
      new PutCommand({

        TableName:
          "Garages",

        Item:
          garage
      })
    )

    return {

      userId:
        garage.userId,

      garageId:
        garage.garageId,

      garageName:
        garage.garageName,

      ownerName:
        garage.ownerName,

      phone:
        garage.phone
    }
  }


/*
 * --------------------------------------------------
 * LOGIN
 * --------------------------------------------------
 */

export const loginUser =
  async (
    phone: string,
    pin: string
  ) => {

    /*
     * OWNER LOGIN
     */

    const ownerResult =
      await db.send(
        new ScanCommand({

          TableName:
            "Garages",

          FilterExpression:
            "phone = :phone",

          ExpressionAttributeValues: {
            ":phone":
              phone
          }
        })
      )

    const owner =
      ownerResult.Items?.[0]

    if (owner) {

      if (
        owner.isActive === false
      ) {
        throw new Error(
          "Account is inactive"
        )
      }

      const validPin =
        await bcrypt.compare(
          pin,
          owner.pinHash
        )

      if (!validPin) {
        throw new Error(
          "Invalid credentials"
        )
      }

      const userId =
        owner.userId ||
        owner.garageId

      const token =
        generateToken({

          userId,

          garageId:
            owner.garageId,

          role:
            "owner"
        })

      return {

        token,

        user: {

          userId,

          role:
            "owner",

          userType:
            "owner",

          garageId:
            owner.garageId,

          ownerName:
            owner.ownerName,

          garageName:
            owner.garageName,

          phone:
            owner.phone
        }
      }
    }


    /*
     * WORKER LOGIN
     */

    const workerResult =
      await db.send(
        new ScanCommand({

          TableName:
            "Workers",

          FilterExpression:
            "phone = :phone",

          ExpressionAttributeValues: {
            ":phone":
              phone
          }
        })
      )

    const worker =
      workerResult.Items?.[0]

    if (worker) {

      if (
        worker.active === false
      ) {
        throw new Error(
          "Worker account is inactive"
        )
      }

      const validPin =
        await bcrypt.compare(
          pin,
          worker.pinHash
        )

      if (!validPin) {
        throw new Error(
          "Invalid credentials"
        )
      }

      const userId =
        worker.userId ||
        worker.workerId

      const token =
        generateToken({

          userId,

          garageId:
            worker.garageId,

          workerId:
            worker.workerId,

          role:
            "worker"
        })

      return {

        token,

        user: {

          userId,

          role:
            "worker",

          userType:
            "worker",

          workerId:
            worker.workerId,

          garageId:
            worker.garageId,

          name:
            worker.name,

          jobRole:
            worker.jobRole ||
            worker.role,

          phone:
            worker.phone
        }
      }
    }

    throw new Error(
      "Invalid credentials"
    )
  }


/*
 * --------------------------------------------------
 * FIND ACCOUNT FOR PIN RECOVERY
 * --------------------------------------------------
 *
 * Returns only server-side identity information.
 *
 * The mobile app never supplies userId,
 * garageId, workerId or role.
 */

export const findAccountByPhone =
  async (
    phone: string
  ) => {

    const normalizedPhone =
      phone.trim()


    /*
     * Check owner first.
     */

    const ownerResult =
      await db.send(
        new ScanCommand({

          TableName:
            "Garages",

          FilterExpression:
            "phone = :phone",

          ExpressionAttributeValues: {
            ":phone":
              normalizedPhone
          }
        })
      )

    const owner =
      ownerResult.Items?.[0]

    if (owner) {

      if (
        owner.isActive === false
      ) {
        return null
      }

      return {

        userId:
          owner.userId ||
          owner.garageId,

        garageId:
          owner.garageId,

        role:
          "owner" as const,

        phone:
          owner.phone
      }
    }


    /*
     * Check worker.
     */

    const workerResult =
      await db.send(
        new ScanCommand({

          TableName:
            "Workers",

          FilterExpression:
            "phone = :phone",

          ExpressionAttributeValues: {
            ":phone":
              normalizedPhone
          }
        })
      )

    const worker =
      workerResult.Items?.[0]

    if (worker) {

      if (
        worker.active === false
      ) {
        return null
      }

      return {

        userId:
          worker.userId ||
          worker.workerId,

        garageId:
          worker.garageId,

        role:
          "worker" as const,

        workerId:
          worker.workerId,

        phone:
          worker.phone
      }
    }

    return null
  }


/*
 * --------------------------------------------------
 * RESET OWNER PIN
 * --------------------------------------------------
 */

export const resetOwnerPin =
  async (
    garageId: string,
    newPin: string
  ) => {

    const {
      UpdateCommand
    } = await import(
      "@aws-sdk/lib-dynamodb"
    )

    const pinHash =
      await bcrypt.hash(
        newPin,
        10
      )

    await db.send(
      new UpdateCommand({

        TableName:
          "Garages",

        Key: {
          garageId
        },

        UpdateExpression:
          "SET pinHash = :pinHash",

        ExpressionAttributeValues: {
          ":pinHash":
            pinHash
        }
      })
    )
  }


/*
 * --------------------------------------------------
 * RESET WORKER PIN
 * --------------------------------------------------
 */

export const resetWorkerPin =
  async (
    workerId: string,
    newPin: string
  ) => {

    const {
      UpdateCommand
    } = await import(
      "@aws-sdk/lib-dynamodb"
    )

    const pinHash =
      await bcrypt.hash(
        newPin,
        10
      )

    await db.send(
      new UpdateCommand({

        TableName:
          "Workers",

        Key: {
          workerId
        },

        UpdateExpression:
          "SET pinHash = :pinHash",

        ExpressionAttributeValues: {
          ":pinHash":
            pinHash
        }
      })
    )
  }