import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb"

import { db } from "../config/dynamodb"

import { v4 as uuidv4 } from "uuid"

const CUSTOMERS_TABLE = "Customers"
const JOBS_TABLE = "Jobs"


/*
|--------------------------------------------------------------------------
| CUSTOMER ERROR
|--------------------------------------------------------------------------
*/

class CustomerError extends Error {

  statusCode: number

  constructor(
    message: string,
    statusCode: number = 400
  ) {

    super(message)

    this.statusCode =
      statusCode
  }
}


/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const createCustomer = async (
  garageId: string,
  data: any
) => {

  const name =
    String(data.name || "").trim()

  const phone =
    String(data.phone || "")
      .replace(/\D/g, "")
      .trim()

  const alternatePhone =
    String(data.alternatePhone || "")
      .replace(/\D/g, "")
      .trim()

  const address =
    String(data.address || "").trim()

  const notes =
    String(data.notes || "").trim()


  if (!garageId) {

    throw new CustomerError(
      "Garage ID is required",
      400
    )
  }


  if (!name) {

    throw new CustomerError(
      "Customer name is required",
      400
    )
  }


  if (!phone) {

    throw new CustomerError(
      "Customer phone number is required",
      400
    )
  }


  /*
   * Prevent duplicate customer phone
   * numbers inside the same garage.
   */

  const existing =
    await findCustomer(
      garageId,
      phone
    )

  if (existing) {

    throw new CustomerError(
      "A customer with this phone number already exists",
      409
    )
  }


  const now =
    new Date().toISOString()


  const customer = {

    customerId:
      uuidv4(),

    garageId,

    name,

    phone,

    alternatePhone,

    address,

    notes,

    totalVehicles: 0,

    totalJobs: 0,

    totalSpent: 0,

    pendingAmount: 0,

    createdAt: now,

    updatedAt: now,

  }


  await db.send(

    new PutCommand({

      TableName:
        CUSTOMERS_TABLE,

      Item:
        customer,

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

          ":garageId":
            garageId,

        },

      })

    )


  const customers =
    result.Items || []


  /*
   * Get jobs for this garage.
   *
   * This allows the customer list to show
   * correct:
   *
   * - total jobs
   * - total vehicles
   * - total spent
   * - pending amount
   *
   * based on actual job status.
   */

  let jobs: any[] = []


  try {

    const jobsResult =
      await db.send(

        new ScanCommand({

          TableName:
            JOBS_TABLE,

          FilterExpression:
            "garageId = :garageId",

          ExpressionAttributeValues: {

            ":garageId":
              garageId,

          },

        })

      )

    jobs =
      jobsResult.Items || []

  } catch (error) {

    console.log(
      "Customer jobs calculation error:",
      error
    )

  }


  return customers.map(
    (customer: any) => {

      const customerJobs =
        jobs.filter(
          job =>
            job.customerId ===
            customer.customerId
        )


      /*
       * Completed jobs count toward
       * totalSpent.
       */

      const completedJobs =
        customerJobs.filter(
          job =>
            job.status ===
            "completed"
        )


      /*
       * Anything that isn't completed
       * remains pending.
       */

      const pendingJobs =
        customerJobs.filter(
          job =>
            job.status !==
            "completed"
        )


      const totalSpent =
        completedJobs.reduce(
          (
            total: number,
            job: any
          ) =>
            total +
            Number(
              job.totalAmount || 0
            ),
          0
        )


      const pendingAmount =
        pendingJobs.reduce(
          (
            total: number,
            job: any
          ) =>
            total +
            Number(
              job.totalAmount || 0
            ),
          0
        )


      /*
       * Count unique vehicles.
       */

      const vehicleNumbers =
        new Set(
          customerJobs
            .map(
              job =>
                job.vehicleNumber
            )
            .filter(Boolean)
        )


      /*
       * Most recent customer visit.
       */

      const sortedJobs =
        [...customerJobs].sort(
          (
            a: any,
            b: any
          ) =>
            new Date(
              b.updatedAt ||
              b.createdAt ||
              0
            ).getTime() -
            new Date(
              a.updatedAt ||
              a.createdAt ||
              0
            ).getTime()
        )


      const lastJob =
        sortedJobs[0]


      return {

        ...customer,

        totalJobs:
          customerJobs.length,

        totalVehicles:
          vehicleNumbers.size,

        totalSpent,

        pendingAmount,

        lastVisit:
          lastJob?.updatedAt ||
          lastJob?.createdAt ||
          null,

      }

    }
  )
}


/*
|--------------------------------------------------------------------------
| GET CUSTOMER BY ID
|--------------------------------------------------------------------------
|
| IMPORTANT:
| garageId is checked here so one garage cannot
| access another garage's customer by changing
| the customerId in the URL.
|
|--------------------------------------------------------------------------
*/

export const getCustomerById =
async (
  garageId: string,
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


  const customer =
    result.Item


  if (!customer) {

    return null

  }


  if (
    customer.garageId !==
    garageId
  ) {

    return null

  }


  return customer
}


/*
|--------------------------------------------------------------------------
| FIND CUSTOMER
|--------------------------------------------------------------------------
|
| Phone is the customer lookup key
| within a garage.
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


  return (
    result.Items?.[0] ||
    null
  )
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


  if (!phone) {

    throw new CustomerError(
      "Customer phone number is required",
      400
    )

  }


  /*
   * FIRST:
   * Look for existing customer.
   */

  const existing =
    await findCustomer(
      garageId,
      phone
    )


  if (existing) {

    return {

      customer:
        existing,

      created:
        false,

    }

  }


  /*
   * SECOND:
   * Create customer.
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

    created:
      true,

  }

}


/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const updateCustomer =
async (
  garageId: string,
  customerId: string,
  data: any
) => {

  /*
   * First make sure the customer belongs
   * to the current garage.
   */

  const existing =
    await getCustomerById(
      garageId,
      customerId
    )


  if (!existing) {

    throw new CustomerError(
      "Customer not found",
      404
    )

  }


  const name =
    data.name !== undefined
      ? String(data.name).trim()
      : existing.name


  const phone =
    data.phone !== undefined
      ? String(data.phone)
          .replace(/\D/g, "")
          .trim()
      : existing.phone


  const alternatePhone =
    data.alternatePhone !== undefined
      ? String(data.alternatePhone)
          .replace(/\D/g, "")
          .trim()
      : (
          existing.alternatePhone ||
          ""
        )


  const address =
    data.address !== undefined
      ? String(data.address).trim()
      : (
          existing.address ||
          ""
        )


  const notes =
    data.notes !== undefined
      ? String(data.notes).trim()
      : (
          existing.notes ||
          ""
        )


  if (!name) {

    throw new CustomerError(
      "Customer name is required",
      400
    )

  }


  if (!phone) {

    throw new CustomerError(
      "Customer phone number is required",
      400
    )

  }


  /*
   * Check duplicate phone only if the
   * phone number changed.
   */

  if (
    phone !==
    existing.phone
  ) {

    const duplicate =
      await findCustomer(
        garageId,
        phone
      )


    if (
      duplicate &&
      duplicate.customerId !==
      customerId
    ) {

      throw new CustomerError(
        "Another customer already uses this phone number",
        409
      )

    }

  }


  const updatedAt =
    new Date().toISOString()


  const result =
    await db.send(

      new UpdateCommand({

        TableName:
          CUSTOMERS_TABLE,

        Key: {

          customerId,

        },

        UpdateExpression: `
          SET
            #name = :name,
            phone = :phone,
            alternatePhone = :alternatePhone,
            address = :address,
            notes = :notes,
            updatedAt = :updatedAt
        `,

        ExpressionAttributeNames: {

          "#name":
            "name",

        },

        ExpressionAttributeValues: {

          ":name":
            name,

          ":phone":
            phone,

          ":alternatePhone":
            alternatePhone,

          ":address":
            address,

          ":notes":
            notes,

          ":updatedAt":
            updatedAt,

        },

        ReturnValues:
          "ALL_NEW",

      })

    )


  return result.Attributes
}


/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
|
| Customer deletion is intentionally blocked
| when jobs exist.
|
| This protects historical job records.
|
|--------------------------------------------------------------------------
*/

export const deleteCustomer =
async (
  garageId: string,
  customerId: string
) => {

  /*
   * Check ownership.
   */

  const existing =
    await getCustomerById(
      garageId,
      customerId
    )


  if (!existing) {

    throw new CustomerError(
      "Customer not found",
      404
    )

  }


  /*
   * Check whether any jobs belong
   * to this customer.
   */

  const jobsResult =
    await db.send(

      new ScanCommand({

        TableName:
          JOBS_TABLE,

        FilterExpression:
          "garageId = :garageId AND customerId = :customerId",

        ExpressionAttributeValues: {

          ":garageId":
            garageId,

          ":customerId":
            customerId,

        },

      })

    )


  const jobs =
    jobsResult.Items || []


  if (jobs.length > 0) {

    throw new CustomerError(

      `Customer cannot be deleted because ${jobs.length} job${
        jobs.length === 1
          ? ""
          : "s"
      } is linked to this customer.`,

      409

    )

  }


  await db.send(

    new DeleteCommand({

      TableName:
        CUSTOMERS_TABLE,

      Key: {

        customerId,

      },

    })

  )


  return true
}