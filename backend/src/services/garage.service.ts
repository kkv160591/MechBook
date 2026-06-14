import {
  GetItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb"

import { unmarshall } from "@aws-sdk/util-dynamodb"

import { db } from "../config/dynamodb"

export const getGarageProfile = async (
  garageId: string
) => {

  const response =
    await db.send(
      new GetItemCommand({

        TableName:
          process.env.GARAGES_TABLE_NAME,

        Key: {
          garageId: {
            S: garageId
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

export const updateGarageProfile =
async (
  garageId: string,
  data: any
) => {

  await db.send(
    new UpdateItemCommand({

      TableName:
        process.env.GARAGES_TABLE_NAME,

      Key: {
        garageId: {
          S: garageId
        }
      },

      UpdateExpression: `
      SET
      garageName = :garageName,
      ownerName = :ownerName,
      phone = :phone,
      email = :email,
      gstNumber = :gstNumber,
      address = :address,
      city = :city,
      #state = :state,
      pincode = :pincode,
      vehicleTypes = :vehicleTypes
      `,

      ExpressionAttributeNames: {
        "#state": "state"
      },

      ExpressionAttributeValues: {

        ":garageName": {
          S: data.garageName || ""
        },

        ":ownerName": {
          S: data.ownerName || ""
        },

        ":phone": {
          S: data.phone || ""
        },

        ":email": {
          S: data.email || ""
        },

        ":gstNumber": {
          S: data.gstNumber || ""
        },

        ":address": {
          S: data.address || ""
        },

        ":city": {
          S: data.city || ""
        },

        ":state": {
          S: data.state || ""
        },

        ":pincode": {
          S: data.pincode || ""
        },

        ":vehicleTypes": {

          L: (
            data.vehicleTypes || []
          )
            .filter(
              (item: any) =>
                typeof item === "string"
            )
            .filter(
              (item: string) =>
                item !== "[object Object]"
            )
            .map(
              (item: string) => ({
                S: item
              })
            )

        }

      }

    })
  )

  return await getGarageProfile(
    garageId
  )

}