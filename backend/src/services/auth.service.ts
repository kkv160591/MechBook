import {
  GetCommand,
  PutCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb"

import { db } from "../config/dynamodb"

import { v4 as uuidv4 } from "uuid"

import bcrypt from "bcryptjs"

import {
  generateToken
} from "../utils/jwt"

export const registerGarage =
  async (data: any) => {

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
          TableName: "Garages",
          FilterExpression:
            "phone = :phone",
          ExpressionAttributeValues: {
            ":phone": phone
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
      await bcrypt.hash(pin, 10)

    const garage = {

      garageId: uuidv4(),

      userType: "owner",

      garageName,
      ownerName,

      phone,
      pinHash,
      role: "owner",
      city,
      state,
      country,
      address,

      logo: logo || "",

      isActive: true,

      createdAt:
        new Date().toISOString()

    }

    await db.send(

      new PutCommand({
        TableName: "Garages",
        Item: garage
      })

    )

    return {

      garageId: garage.garageId,
      garageName: garage.garageName,
      ownerName: garage.ownerName,
      phone: garage.phone

    }

  }

export const loginUser =
  async (
    phone: string,
    pin: string
  ) => {

    const ownerResult =
      await db.send(

        new ScanCommand({
          TableName: "Garages",
          FilterExpression:
            "phone = :phone",
          ExpressionAttributeValues: {
            ":phone": phone
          }
        })

      )

    const owner =
      ownerResult.Items?.[0]

    if (owner) {

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

      const token =
        generateToken({

          garageId:
            owner.garageId,

          role: "owner"

        })

      return {

        token,

        user: {

          role: "owner",

          garageId:
            owner.garageId,

          ownerName:
            owner.ownerName,

          garageName:
            owner.garageName

        }

      }

    }

    const workerResult =
      await db.send(

        new ScanCommand({
          TableName: "Worker",
          FilterExpression:
            "phone = :phone",
          ExpressionAttributeValues: {
            ":phone": phone
          }
        })

      )

    const worker =
      workerResult.Items?.[0]

    if (worker) {

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

      const token =
        generateToken({

          garageId:
            worker.garageId,

          workerId:
            worker.workerId,

          role: "worker"

        })

      return {

        token,

        user: {

          role: "worker",

          workerId:
            worker.workerId,

          garageId:
            worker.garageId,

          name:
            worker.name

        }

      }

    }

    throw new Error(
      "Invalid credentials"
    )

  }