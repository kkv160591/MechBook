import {
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb"

import {
  unmarshall,
  marshall,
} from "@aws-sdk/util-dynamodb"

import { v4 as uuid } from "uuid"

import { db } from "../config/dynamodb"

import {
  getOrCreateSubscription,
} from "./subscription.service"

import {
  findOrCreateCustomer,
} from "./customer.service"


const JOBS_TABLE =
  process.env.JOBS_TABLE_NAME!

const CUSTOMERS_TABLE =
  process.env.CUSTOMERS_TABLE_NAME ||
  "Customers"

const INVENTORY_TABLE =
  process.env.INVENTORY_TABLE_NAME ||
  "Inventory"

const SUBSCRIPTIONS_TABLE =
  process.env.SUBSCRIPTIONS_TABLE_NAME ||
  "Subscriptions"


/*
|--------------------------------------------------------------------------
| JOB LIMIT ERROR
|--------------------------------------------------------------------------
*/

export class JobLimitReachedError extends Error {

  code = "JOB_LIMIT_REACHED"

  constructor() {

    super(
      "Monthly job limit reached"
    )

    this.name =
      "JobLimitReachedError"

  }

}


/*
|--------------------------------------------------------------------------
| INVENTORY STOCK ERROR
|--------------------------------------------------------------------------
*/

export class InsufficientStockError extends Error {

  code = "INSUFFICIENT_STOCK"

  partName: string

  available: number

  requested: number

  constructor(
    partName: string,
    available: number,
    requested: number
  ) {

    super(
      `Insufficient stock for ${partName}. Available: ${available}, requested: ${requested}`
    )

    this.name =
      "InsufficientStockError"

    this.partName =
      partName

    this.available =
      available

    this.requested =
      requested

  }

}


/*
|--------------------------------------------------------------------------
| NORMALIZE PARTS
|--------------------------------------------------------------------------
|
| If the same inventory part is added twice to a job, combine the
| quantities before creating DynamoDB inventory updates.
|
|--------------------------------------------------------------------------
*/

const normalizeParts =
(
  parts: any[]
) => {

  const map =
    new Map<string, any>()

  for (
    const part of parts || []
  ) {

    const inventoryId =
      part.inventoryId ||
      part.partId ||
      part.id ||
      part._id

    /*
     * Manual parts do not belong to inventory.
     */

    if (!inventoryId) {

      continue

    }

    const quantity =
      Math.max(
        1,
        Number(part.quantity) || 1
      )

    const existing =
      map.get(
        String(inventoryId)
      )

    if (existing) {

      existing.quantity +=
        quantity

      existing.totalPrice =
        existing.quantity *
        existing.unitPrice

    } else {

      map.set(
        String(inventoryId),
        {
          ...part,

          inventoryId,

          partId:
            inventoryId,

          quantity,

          unitPrice:
            Number(
              part.unitPrice || 0
            ),

          totalPrice:
            quantity *
            Number(
              part.unitPrice || 0
            ),
        }
      )

    }

  }

  return Array.from(
    map.values()
  )

}


/*
|--------------------------------------------------------------------------
| CREATE JOB
|--------------------------------------------------------------------------
*/

export const createJob =
async (
  garageId: string,
  data: any
) => {

  /*
   * ---------------------------------------------------------------
   * CUSTOMER
   * ---------------------------------------------------------------
   *
   * If frontend supplied customerId, use it.
   *
   * Otherwise find/create customer using phone.
   */

  let customerId =
    data.customerId || null

  let customer: any = null


  if (customerId) {

    const customerResponse =
      await db.send(
        new GetItemCommand({

          TableName:
            CUSTOMERS_TABLE,

          Key: {

            customerId: {
              S: customerId,
            },

          },

        })
      )

    if (!customerResponse.Item) {

      throw new Error(
        "Selected customer was not found"
      )

    }

    customer =
      unmarshall(
        customerResponse.Item
      )


    /*
     * Security check:
     *
     * Do not allow one garage to attach another garage's
     * customer to its job.
     */

    if (
      customer.garageId !==
      garageId
    ) {

      throw new Error(
        "Invalid customer"
      )

    }

  } else {

    const result =
      await findOrCreateCustomer(
        garageId,
        {
          name:
            data.customerName,

          phone:
            data.phone,

          address:
            data.customerAddress,
        }
      )

    customer =
      result.customer

    customerId =
      customer.customerId

  }


  /*
   * ---------------------------------------------------------------
   * INVENTORY PARTS
   * ---------------------------------------------------------------
   */

  const normalizedParts =
    normalizeParts(
      data.parts || []
    )


  /*
   * ---------------------------------------------------------------
   * VALIDATE INVENTORY IDS
   * ---------------------------------------------------------------
   *
   * Fetch each inventory item before the transaction so we can
   * provide useful errors.
   */

  for (
    const part of normalizedParts
  ) {

    const inventoryResponse =
      await db.send(

        new GetItemCommand({

          TableName:
            INVENTORY_TABLE,

          Key: {

            partId: {
              S:
                String(
                  part.inventoryId
                ),
            },

          },

        })

      )


    if (
      !inventoryResponse.Item
    ) {

      throw new Error(
        `Inventory item not found: ${part.name || part.inventoryId}`
      )

    }


    const inventoryItem =
      unmarshall(
        inventoryResponse.Item
      )


    /*
     * Make sure inventory belongs to this garage.
     */

    if (
      inventoryItem.garageId !==
      garageId
    ) {

      throw new Error(
        `Invalid inventory item: ${part.name || part.inventoryId}`
      )

    }


    const available =
      Number(
        inventoryItem.stock ?? 0
      )

    const requested =
      Number(
        part.quantity ?? 0
      )


    if (
      requested <= 0
    ) {

      throw new Error(
        `Invalid quantity for ${part.name || part.inventoryId}`
      )

    }


    if (
      requested >
      available
    ) {

      throw new InsufficientStockError(
        part.name ||
          inventoryItem.name ||
          "Inventory item",

        available,

        requested
      )

    }


    /*
     * Keep the current stock available to the rest of the
     * function if needed.
     */

    part.availableStock =
      available

  }


  /*
   * ---------------------------------------------------------------
   * SUBSCRIPTION
   * ---------------------------------------------------------------
   */

  let subscription =
    await getOrCreateSubscription(
      garageId
    )


  /*
   * ---------------------------------------------------------------
   * RETRY LOOP
   * ---------------------------------------------------------------
   */

  for (
    let attempt = 0;
    attempt < 3;
    attempt++
  ) {

    const jobsUsed =
      Number(
        subscription.jobsUsed ?? 0
      )

    const jobLimit =
      Number(
        subscription.jobLimit ?? 0
      )

    const boosterJobs =
      Number(
        subscription.boosterJobs ?? 0
      )


    const totalAvailable =
      jobLimit === -1
        ? -1
        : jobLimit +
          boosterJobs


    /*
     * -------------------------------------------------------------
     * CHECK PLAN LIMIT
     * -------------------------------------------------------------
     */

    if (
      totalAvailable !== -1 &&
      jobsUsed >=
        totalAvailable
    ) {

      throw new JobLimitReachedError()

    }


    /*
     * -------------------------------------------------------------
     * CREATE JOB
     * -------------------------------------------------------------
     */

    const jobId =
      uuid()

    const now =
      new Date().toISOString()


    const item = {

      jobId,

      garageId,


      /*
       * CUSTOMER
       */

      customerId,

      customerName:
        data.customerName ||
        customer.name ||
        "",

      phone:
        data.phone ||
        customer.phone ||
        "",

      customerAddress:
        data.customerAddress ||
        customer.address ||
        "",


      /*
       * VEHICLE
       */

      vehicleNumber:
        data.vehicleNumber || "",

      vehicleBrand:
        data.vehicleBrand || "",

      vehicleModel:
        data.vehicleModel || "",

      vehicleType:
        data.vehicleType ||
        "2 Wheeler",

      odometer:
        data.odometer || "",


      /*
       * JOB
       */

      status:
        "pending",

      workerId:
        data.workerId || null,

      workerName:
        data.workerName || "",

      priority:
        data.priority ||
        "Normal",

      deliveryDate:
        data.deliveryDate || "",

      discount:
        Number(data.discount || 0),

      laborCost:
        Number(data.laborCost || 0),

      totalAmount:
        Number(data.totalAmount || 0),


      /*
       * COMPLAINT
       */

      complaint:
        data.complaint || "",


      /*
       * INSPECTION
       */

      inspectionNotes:
        data.inspectionNotes || "",


      /*
       * SERVICES
       */

      services:
        data.services || [],


      /*
       * PARTS
       */

      parts:
        normalizedParts.map(
          (part) => {

            const {
              availableStock,
              ...cleanPart
            } = part

            return cleanPart

          }
        ),


      createdAt:
        now,

      updatedAt:
        now,

    }


    /*
     * -------------------------------------------------------------
     * TRANSACTION ITEMS
     * -------------------------------------------------------------
     */

    const transactItems: any[] = []


    /*
     * -------------------------------------------------------------
     * 1. CREATE JOB
     * -------------------------------------------------------------
     */

    transactItems.push({

      Put: {

        TableName:
          JOBS_TABLE,

        Item:
          marshall(
            item,
            {
              removeUndefinedValues:
                true
            }
          ),

        ConditionExpression:
          "attribute_not_exists(jobId)",

      },

    })


    /*
     * -------------------------------------------------------------
     * 2. UPDATE CUSTOMER STATS
     * -------------------------------------------------------------
     *
     * Every completed/created job increments totalJobs.
     *
     * totalSpent is increased using job total.
     *
     * pendingAmount is increased because new jobs start as pending.
     */

    transactItems.push({

      Update: {

        TableName:
          CUSTOMERS_TABLE,

        Key: {

          customerId: {
            S:
              customerId,
          },

        },

        UpdateExpression: `
          SET
            totalJobs = if_not_exists(totalJobs, :zero) + :one,
            totalSpent = if_not_exists(totalSpent, :zero) + :totalAmount,
            pendingAmount = if_not_exists(pendingAmount, :zero) + :totalAmount,
            updatedAt = :updatedAt
        `,

        ExpressionAttributeValues: {

          ":zero": {
            N: "0",
          },

          ":one": {
            N: "1",
          },

          ":totalAmount": {
            N:
              Number(
                data.totalAmount || 0
              ).toString(),
          },

          ":garageId": {
            S:
              garageId,
          },

          ":updatedAt": {
            S:
              now,
          },

        },

        ConditionExpression:
          "attribute_exists(customerId) AND garageId = :garageId",

      },

    })


    /*
     * -------------------------------------------------------------
     * 3. DECREASE INVENTORY
     * -------------------------------------------------------------
     *
     * IMPORTANT:
     *
     * stock = stock - requestedQty
     *
     * AND
     *
     * stock >= requestedQty
     *
     * This prevents negative stock and also protects against
     * two workers trying to sell the same final stock.
     */

    for (
      const part of normalizedParts
    ) {

      transactItems.push({

        Update: {

          TableName:
            INVENTORY_TABLE,

          Key: {

            partId: {

              S:
                String(
                  part.inventoryId
                ),

            },

          },

          UpdateExpression:
            "SET stock = stock - :quantity, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(partId) AND garageId = :garageId AND stock >= :quantity",

          ExpressionAttributeValues: {

            ":quantity": {

              N:
                Number(
                  part.quantity
                ).toString(),

            },

            ":garageId": {

              S:
                garageId,

            },

            ":updatedAt": {

              S:
                now,

            },

          },

        },

      })

    }


    /*
     * -------------------------------------------------------------
     * 4. UPDATE SUBSCRIPTION
     * -------------------------------------------------------------
     */

    transactItems.push({

      Update: {

        TableName:
          SUBSCRIPTIONS_TABLE,

        Key: {

          garageId: {

            S:
              garageId,

          },

        },

        UpdateExpression:
          "SET jobsUsed = :newJobsUsed, updatedAt = :updatedAt",

        ConditionExpression:
          "jobsUsed = :currentJobsUsed AND jobLimit = :currentJobLimit AND boosterJobs = :currentBoosterJobs",

        ExpressionAttributeValues: {

          ":currentJobsUsed": {

            N:
              jobsUsed.toString(),

          },

          ":currentJobLimit": {

            N:
              jobLimit.toString(),

          },

          ":currentBoosterJobs": {

            N:
              boosterJobs.toString(),

          },

          ":newJobsUsed": {

            N:
              (
                jobsUsed + 1
              ).toString(),

          },

          ":updatedAt": {

            S:
              now,

          },

        },

      },

    })


    /*
     * -------------------------------------------------------------
     * EXECUTE EVERYTHING ATOMICALLY
     * -------------------------------------------------------------
     */

    try {

      await db.send(

        new TransactWriteItemsCommand({

          TransactItems:
            transactItems,

        })

      )


      /*
       * SUCCESS
       */

      return item

    }


    catch (error: any) {

      /*
       * -----------------------------------------------------------
       * TRANSACTION CONFLICT
       * -----------------------------------------------------------
       */

      if (
        error?.name ===
        "TransactionCanceledException"
      ) {

        /*
         * Re-read subscription because another request may have
         * consumed a job slot.
         */

        subscription =
          await getOrCreateSubscription(
            garageId
          )


        const latestJobsUsed =
          Number(
            subscription.jobsUsed ?? 0
          )

        const latestJobLimit =
          Number(
            subscription.jobLimit ?? 0
          )

        const latestBoosterJobs =
          Number(
            subscription.boosterJobs ?? 0
          )


        const latestTotalAvailable =
          latestJobLimit === -1
            ? -1
            : latestJobLimit +
              latestBoosterJobs


        if (
          latestTotalAvailable !== -1 &&
          latestJobsUsed >=
            latestTotalAvailable
        ) {

          throw new JobLimitReachedError()

        }


        /*
         * Retry transaction.
         */

        if (
          attempt < 2
        ) {

          continue

        }

      }


      throw error

    }

  }


  throw new Error(
    "Unable to create job"
  )

}


/*
|--------------------------------------------------------------------------
| GET JOBS
|--------------------------------------------------------------------------
*/

export const getJobs =
async (
  garageId: string
) => {

  const response =
    await db.send(

      new ScanCommand({

        TableName:
          JOBS_TABLE,

      })

    )


  const jobs =
    (response.Items || [])
      .map(
        item =>
          unmarshall(item)
      )
      .filter(
        (job: any) =>
          job.garageId ===
          garageId
      )
      .sort(
        (a: any, b: any) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      )


  return jobs

}


/*
|--------------------------------------------------------------------------
| GET JOB BY ID
|--------------------------------------------------------------------------
*/

export const getJobById =
async (
  jobId: string
) => {

  const response =
    await db.send(

      new GetItemCommand({

        TableName:
          JOBS_TABLE,

        Key: {

          jobId: {

            S:
              jobId,

          },

        },

      })

    )


  if (
    !response.Item
  ) {

    return null

  }


  return unmarshall(
    response.Item
  )

}


/*
|--------------------------------------------------------------------------
| UPDATE JOB
|--------------------------------------------------------------------------
*/

export const updateJob =
async (
  jobId: string,
  data: any
) => {

  const existing =
    await getJobById(
      jobId
    )


  if (!existing) {

    return null

  }


  const updated = {

    ...existing,

    ...data,

    updatedAt:
      new Date().toISOString(),

  }


  await db.send(

    new PutItemCommand({

      TableName:
        JOBS_TABLE,

      Item:
        marshall(
          updated,
          {
            removeUndefinedValues:
              true
          }
        ),

    })

  )


  return updated

}


/*
|--------------------------------------------------------------------------
| ASSIGN WORKER
|--------------------------------------------------------------------------
*/

export const assignWorker =
async (
  jobId: string,
  workerId: string
) => {

  await db.send(

    new UpdateItemCommand({

      TableName:
        JOBS_TABLE,

      Key: {

        jobId: {

          S:
            jobId,

        },

      },

      UpdateExpression:
        "SET workerId = :workerId, updatedAt = :updatedAt",

      ExpressionAttributeValues: {

        ":workerId": {

          S:
            workerId,

        },

        ":updatedAt": {

          S:
            new Date().toISOString(),

        },

      },

    })

  )

}


/*
|--------------------------------------------------------------------------
| UPDATE JOB STATUS
|--------------------------------------------------------------------------
*/

export const updateJobStatus =
async (
  jobId: string,
  status: string
) => {

  await db.send(

    new UpdateItemCommand({

      TableName:
        JOBS_TABLE,

      Key: {

        jobId: {

          S:
            jobId,

        },

      },

      UpdateExpression:
        "SET #status = :status, updatedAt = :updatedAt",

      ExpressionAttributeNames: {

        "#status":
          "status",

      },

      ExpressionAttributeValues: {

        ":status": {

          S:
            status,

        },

        ":updatedAt": {

          S:
            new Date().toISOString(),

        },

      },

    })

  )

}


/*
|--------------------------------------------------------------------------
| DELETE JOB
|--------------------------------------------------------------------------
*/

export const deleteJob =
async (
  jobId: string
) => {

  await db.send(

    new DeleteItemCommand({

      TableName:
        JOBS_TABLE,

      Key: {

        jobId: {

          S:
            jobId,

        },

      },

    })

  )

}