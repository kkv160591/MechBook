import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb"

import { db } from "../config/dynamodb"

import { v4 as uuidv4 } from "uuid"

export const createPart = async (
  garageId: string,
  data: any
) => {

  const part = {

    partId: uuidv4(),

    garageId,

    name: data.name,

    sku: data.sku,

    category: data.category,

    buyingPrice: Number(data.buyingPrice),

    sellingPrice: Number(data.sellingPrice),

    stock: Number(data.stock),

    minStock: Number(data.minStock),

    createdAt:
      new Date().toISOString()

  }

  await db.send(

    new PutCommand({
      TableName: "Inventory",
      Item: part
    })

  )

  return part

}

export const getInventory =
async (garageId: string) => {

  const result =
    await db.send(

      new ScanCommand({
        TableName: "Inventory",
        FilterExpression:
          "garageId = :garageId",
        ExpressionAttributeValues: {
          ":garageId": garageId
        }
      })

    )

  return result.Items || []

}

export const getPartById =
async (partId: string) => {

  const result =
    await db.send(

      new GetCommand({
        TableName: "Inventory",
        Key: { partId }
      })

    )

  return result.Item

}

export const updatePart =
async (
  partId: string,
  data: any
) => {

  await db.send(

    new UpdateCommand({

      TableName: "Inventory",

      Key: { partId },

      UpdateExpression: `
      SET
      #name = :name,
      sku = :sku,
      category = :category,
      buyingPrice = :buyingPrice,
      sellingPrice = :sellingPrice,
      stock = :stock,
      minStock = :minStock
      `,

      ExpressionAttributeNames: {
        "#name": "name"
      },

      ExpressionAttributeValues: {

        ":name": data.name,

        ":sku": data.sku,

        ":category": data.category,

        ":buyingPrice":
          Number(data.buyingPrice),

        ":sellingPrice":
          Number(data.sellingPrice),

        ":stock":
          Number(data.stock),

        ":minStock":
          Number(data.minStock)

      }

    })

  )

}

export const deletePart =
async (partId: string) => {

  await db.send(

    new DeleteCommand({
      TableName: "Inventory",
      Key: { partId }
    })

  )

}

export const getLowStockItems =
async (garageId: string) => {

  const items =
    await getInventory(
      garageId
    )

  return items.filter(
    (item: any) =>
      item.stock <= item.minStock
  )

}