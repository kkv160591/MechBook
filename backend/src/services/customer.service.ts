import {
  PutCommand,
  ScanCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb"

import { db } from "../config/dynamodb"
import { v4 as uuidv4 } from "uuid"

const CUSTOMERS_TABLE = "Customers"

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const createCustomer = async (
  garageId: string,
  data: any
) => {

  const customer = {
    customerId: uuidv4(),

    garageId,

    name: String(data.name || "").trim(),

    phone: String(data.phone || "").trim(),

    alternatePhone:
      String(data.alternatePhone || "").trim(),

    address:
      String(data.address || "").trim(),

    notes:
      String(data.notes || "").trim(),

    totalVehicles: 0,

    totalJobs: 0,

    totalSpent: 0,

    pendingAmount: 0,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  }

  await db.send(
    new PutCommand({
      TableName: CUSTOMERS_TABLE,

      Item: customer,

      ConditionExpression:
        "attribute_not_exists(customerId)",
    })
  )

  return customer
}


/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

export const getCustomers =
async (
  garageId: string
) => {

  const result =
    await db.send(
      new ScanCommand({

        TableName:
          CUSTOMERS_TABLE,

        FilterExpression:
          "garageId = :garageId",

        ExpressionAttributeValues: {
          ":garageId": garageId,
        },

      })
    )

  return result.Items || []
}


/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID
|--------------------------------------------------------------------------
*/

export const getCustomerById =
async (
  customerId: string
) => {

  const result =
    await db.send(
      new GetCommand({

        TableName:
          CUSTOMERS_TABLE,

        Key: {
          customerId,
        },

      })
    )

  return result.Item
}


/*
|--------------------------------------------------------------------------
| FIND CUSTOMER
|--------------------------------------------------------------------------
|
| We use phone as the primary identity because customer names can
| be duplicated.
|
| IMPORTANT:
| Ideally later add a DynamoDB GSI:
|
|   garageId-phone-index
|
| Then replace this Scan with QueryCommand.
|
|--------------------------------------------------------------------------
*/

export const findCustomer =
async (
  garageId: string,
  phone: string
) => {

  const normalizedPhone =
    String(phone || "")
      .replace(/\D/g, "")
      .trim()

  if (!normalizedPhone) {
    return null
  }

  const result =
    await db.send(
      new ScanCommand({

        TableName:
          CUSTOMERS_TABLE,

        FilterExpression:
          "garageId = :garageId AND phone = :phone",

        ExpressionAttributeValues: {

          ":garageId":
            garageId,

          ":phone":
            normalizedPhone,

        },

      })
    )

  return result.Items?.[0] || null
}


/*
|--------------------------------------------------------------------------
| FIND OR CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const findOrCreateCustomer =
async (
  garageId: string,
  data: any
) => {

  const phone =
    String(data.phone || "")
      .replace(/\D/g, "")
      .trim()

  const name =
    String(data.name || "")
      .trim()

  const address =
    String(data.address || "")
      .trim()


  /*
   * Phone is required for reliable customer identity.
   */

  if (!phone) {

    throw new Error(
      "Customer phone number is required"
    )

  }


  /*
   * FIRST: LOOK FOR EXISTING CUSTOMER
   */

  const existing =
    await findCustomer(
      garageId,
      phone
    )

  if (existing) {

    /*
     * If customer already exists, return it.
     *
     * We intentionally do not overwrite the existing
     * customer name/address here.
     */

    return {
      customer: existing,
      created: false,
    }

  }


  /*
   * SECOND: CREATE CUSTOMER
   */

  const customer =
    await createCustomer(
      garageId,
      {
        name,
        phone,
        address,
      }
    )

  return {
    customer,
    created: true,
  }

}