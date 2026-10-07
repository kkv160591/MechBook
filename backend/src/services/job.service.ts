import {
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb"

import {
  handleJobCompleted,
} from "./notification.service"

import { unmarshall, marshall } from "@aws-sdk/util-dynamodb"
import { v4 as uuid } from "uuid"

import { db } from "../config/dynamodb"
import { getOrCreateSubscription } from "./subscription.service"

const JOBS_TABLE = process.env.JOBS_TABLE_NAME!
const CUSTOMERS_TABLE =
  process.env.CUSTOMERS_TABLE_NAME || "Customers"
const INVENTORY_TABLE =
  process.env.INVENTORY_TABLE_NAME || "Inventory"
const SUBSCRIPTIONS_TABLE =
  process.env.SUBSCRIPTIONS_TABLE_NAME || "Subscriptions"

// ============================================================
// ERRORS
// ============================================================

export class JobLimitReachedError extends Error {
  code = "JOB_LIMIT_REACHED"

  constructor() {
    super("Monthly job limit reached")
    this.name = "JobLimitReachedError"
  }
}

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

    this.name = "InsufficientStockError"
    this.partName = partName
    this.available = available
    this.requested = requested
  }
}

// ============================================================
// HELPERS
// ============================================================

const getInventoryId = (part: any) => {
  return (
    part?.inventoryId ||
    part?.partId ||
    part?.id ||
    part?._id ||
    null
  )
}

const getPartUnitPrice = (part: any) => {
  return Number(
    part?.actualUnitPrice ??
      part?.unitPrice ??
      part?.estimatedUnitPrice ??
      part?.sellingPrice ??
      part?.price ??
      0
  )
}

/**
 * Normalize inventory parts.
 *
 * Important:
 * - Manual parts without inventoryId are ignored, same as the
 *   existing create-job behavior.
 * - Duplicate inventory parts are combined.
 */
const normalizeParts = (parts: any[]) => {
  const map = new Map<string, any>()

  for (const part of Array.isArray(parts) ? parts : []) {
    const inventoryId = getInventoryId(part)

    if (!inventoryId) {
      continue
    }

    const quantity = Math.max(
      1,
      Number(part.quantity) || 1
    )

    const unitPrice = getPartUnitPrice(part)

    const existing = map.get(String(inventoryId))

    if (existing) {
      existing.quantity += quantity

      existing.totalPrice =
        existing.quantity * existing.actualUnitPrice
    } else {
      map.set(String(inventoryId), {
        inventoryId,
        partId: inventoryId,
        name: part.name || "",
        quantity,
        estimatedUnitPrice: Number(
          part.estimatedUnitPrice ??
            part.unitPrice ??
            unitPrice
        ),
        actualUnitPrice: unitPrice,
        unitPrice,
        totalPrice: quantity * unitPrice,
      })
    }
  }

  return Array.from(map.values())
}

const normalizePhone = (phone: any) => {
  return String(phone || "").trim()
}

// ============================================================
// CUSTOMER HELPERS
// ============================================================

export const findCustomerByPhone = async (
  garageId: string,
  phone: string
) => {
  const normalizedPhone = normalizePhone(phone)

  if (!normalizedPhone) {
    return null
  }

  const result = await db.send(
    new ScanCommand({
      TableName: CUSTOMERS_TABLE,

      FilterExpression:
        "garageId = :garageId AND phone = :phone",

      ExpressionAttributeValues: marshall({
        ":garageId": garageId,
        ":phone": normalizedPhone,
      }),
    })
  )

  if (!result.Items || result.Items.length === 0) {
    return null
  }

  return unmarshall(result.Items[0])
}

// ============================================================
// CREATE JOB
// ============================================================

export const createJob = async (
  garageId: string,
  data: any
) => {
  const totalAmount = Number(data.totalAmount || 0)

  // ----------------------------------------------------------
  // CUSTOMER
  // ----------------------------------------------------------

  let customer: any = null
  let newCustomer: any = null

  if (data.customerId) {
    const customerResult = await db.send(
      new GetItemCommand({
        TableName: CUSTOMERS_TABLE,

        Key: marshall({
          customerId: data.customerId,
        }),
      })
    )

    if (!customerResult.Item) {
      throw new Error("Customer not found")
    }

    customer = unmarshall(customerResult.Item)

    if (customer.garageId !== garageId) {
      throw new Error("Customer does not belong to this garage")
    }
  } else {
    const phone = normalizePhone(data.phone)

    if (!phone) {
      throw new Error("Customer phone number is required")
    }

    customer = await findCustomerByPhone(
      garageId,
      phone
    )

    if (!customer) {
      const customerId = uuid()

      newCustomer = {
        customerId,
        garageId,

        name: data.customerName || "",
        phone,

        alternatePhone: "",
        address: data.customerAddress || "",
        notes: "",

        totalVehicles: 0,
        totalJobs: 1,
        totalSpent: totalAmount,
        pendingAmount: totalAmount,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      customer = newCustomer
    }
  }

  // ----------------------------------------------------------
  // PARTS
  // ----------------------------------------------------------

  const normalizedParts = normalizeParts(
    data.parts || []
  )

  // Validate inventory before transaction
  for (const part of normalizedParts) {
    const inventoryResult = await db.send(
      new GetItemCommand({
        TableName: INVENTORY_TABLE,

        Key: marshall({
          partId: part.partId,
        }),
      })
    )

    if (!inventoryResult.Item) {
      throw new Error(
        `Inventory item not found: ${part.name || part.partId}`
      )
    }

    const inventory = unmarshall(
      inventoryResult.Item
    )

    if (inventory.garageId !== garageId) {
      throw new Error(
        `Inventory item does not belong to this garage`
      )
    }

    const availableStock = Number(
      inventory.stock || 0
    )

    const requestedQuantity = Number(
      part.quantity || 0
    )

    if (
      requestedQuantity <= 0 ||
      requestedQuantity > availableStock
    ) {
      throw new InsufficientStockError(
        part.name || "Unknown part",
        availableStock,
        requestedQuantity
      )
    }

    part.availableStock = availableStock
  }

  // ----------------------------------------------------------
  // SUBSCRIPTION / JOB LIMIT
  // ----------------------------------------------------------

  const subscription =
    await getOrCreateSubscription(garageId)

  for (let attempt = 0; attempt < 3; attempt++) {
    const jobsUsed = Number(
      subscription.jobsUsed || 0
    )

    const jobLimit = Number(
      subscription.jobLimit || 0
    )

    const boosterJobs = Number(
      subscription.boosterJobs || 0
    )

    const unlimited =
      subscription.unlimited === true ||
      jobLimit === -1

    const totalAvailable = unlimited
      ? -1
      : jobLimit + boosterJobs

    if (
      !unlimited &&
      jobsUsed >= totalAvailable
    ) {
      throw new JobLimitReachedError()
    }

    const jobId = uuid()
    const now = new Date().toISOString()

    const job = {
      jobId,
      garageId,

      customerId: customer.customerId,
      customerName:
        data.customerName ||
        customer.name ||
        "",
      phone:
        normalizePhone(data.phone) ||
        customer.phone ||
        "",
      customerAddress:
        data.customerAddress ||
        customer.address ||
        "",

      vehicleNumber:
        data.vehicleNumber || "",
      vehicleBrand:
        data.vehicleBrand || "",
      vehicleModel:
        data.vehicleModel || "",
      vehicleType:
        data.vehicleType || "2 Wheeler",
      odometer:
        data.odometer || "",

      status: "pending",

      workerId:
        data.workerId || null,
      workerName:
        data.workerName || "",

      priority:
        data.priority || "Normal",

      deliveryDate:
        data.deliveryDate || "",

      discount:
        Number(data.discount || 0),

      discountType:
        data.discountType || "amount",

      laborCost:
        Number(data.laborCost || 0),

      totalAmount,

      complaint:
        data.complaint || "",

      inspectionNotes:
        data.inspectionNotes || "",

      services:
        Array.isArray(data.services)
          ? data.services
          : [],

      parts: normalizedParts.map(
        (part) => {
          const { availableStock, ...cleanPart } =
            part

          return cleanPart
        }
      ),

      createdAt: now,
      updatedAt: now,
    }

    const transactItems: any[] = []

    // --------------------------------------------------------
    // NEW CUSTOMER
    // --------------------------------------------------------

    if (newCustomer) {
      transactItems.push({
        Put: {
          TableName: CUSTOMERS_TABLE,

          Item: marshall(newCustomer, {
            removeUndefinedValues: true,
          }),

          ConditionExpression:
            "attribute_not_exists(customerId)",
        },
      })
    }

    // --------------------------------------------------------
    // JOB
    // --------------------------------------------------------

    transactItems.push({
      Put: {
        TableName: JOBS_TABLE,

        Item: marshall(job, {
          removeUndefinedValues: true,
        }),

        ConditionExpression:
          "attribute_not_exists(jobId)",
      },
    })

    // --------------------------------------------------------
    // EXISTING CUSTOMER
    // --------------------------------------------------------

    if (!newCustomer) {
      const oldTotalJobs = Number(
        customer.totalJobs || 0
      )

      const oldTotalSpent = Number(
        customer.totalSpent || 0
      )

      const oldPendingAmount = Number(
        customer.pendingAmount || 0
      )

      transactItems.push({
        Update: {
          TableName: CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              customer.customerId,
          }),

          UpdateExpression:
            "SET totalJobs = :totalJobs, totalSpent = :totalSpent, pendingAmount = :pendingAmount, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(customerId) AND garageId = :garageId",

          ExpressionAttributeValues: marshall({
            ":totalJobs":
              oldTotalJobs + 1,

            ":totalSpent":
              oldTotalSpent + totalAmount,

            ":pendingAmount":
              oldPendingAmount + totalAmount,

            ":updatedAt": now,

            ":garageId": garageId,
          }),
        },
      })
    }

    // --------------------------------------------------------
    // INVENTORY
    // --------------------------------------------------------

    for (const part of normalizedParts) {
      transactItems.push({
        Update: {
          TableName: INVENTORY_TABLE,

          Key: marshall({
            partId: part.partId,
          }),

          UpdateExpression:
            "SET stock = stock - :quantity, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(partId) AND garageId = :garageId AND stock >= :quantity",

          ExpressionAttributeValues: marshall({
            ":quantity":
              Number(part.quantity),

            ":updatedAt": now,

            ":garageId": garageId,
          }),
        },
      })
    }

    // --------------------------------------------------------
    // SUBSCRIPTION
    // --------------------------------------------------------

    const subscriptionKey: any = {
      garageId,
    }

    if (
      subscription.subscriptionId
    ) {
      subscriptionKey.subscriptionId =
        subscription.subscriptionId
    }

    transactItems.push({
      Update: {
        TableName: SUBSCRIPTIONS_TABLE,

        Key: marshall(subscriptionKey),

        UpdateExpression:
          "SET jobsUsed = jobsUsed + :one",

        ConditionExpression:
          "jobsUsed = :jobsUsed AND (jobLimit = :jobLimit OR attribute_not_exists(jobLimit))",

        ExpressionAttributeValues:
          marshall({
            ":one": 1,
            ":jobsUsed": jobsUsed,
            ":jobLimit": jobLimit,
          }),
      },
    })

    try {
      await db.send(
        new TransactWriteItemsCommand({
          TransactItems: transactItems,
        })
      )

      return job
    } catch (error: any) {
      if (
        error?.name ===
        "TransactionCanceledException"
      ) {
        const latestSubscription =
          await getOrCreateSubscription(
            garageId
          )

        const latestUsed = Number(
          latestSubscription.jobsUsed || 0
        )

        const latestLimit = Number(
          latestSubscription.jobLimit || 0
        )

        const latestBooster = Number(
          latestSubscription.boosterJobs || 0
        )

        const latestUnlimited =
          latestSubscription.unlimited === true ||
          latestLimit === -1

        if (
          !latestUnlimited &&
          latestUsed >=
            latestLimit + latestBooster
        ) {
          throw new JobLimitReachedError()
        }

        continue
      }

      throw error
    }
  }

  throw new Error(
    "Unable to create job"
  )
}

// ============================================================
// GET ALL JOBS
// ============================================================

export const getJobs = async (
  garageId: string
) => {
  const result = await db.send(
    new ScanCommand({
      TableName: JOBS_TABLE,
    })
  )

  const jobs = (result.Items || [])
    .map((item) => unmarshall(item))
    .filter(
      (job: any) =>
        job.garageId === garageId
    )

  jobs.sort(
    (a: any, b: any) =>
      new Date(
        b.createdAt || 0
      ).getTime() -
      new Date(
        a.createdAt || 0
      ).getTime()
  )

  return jobs
}

// ============================================================
// GET JOB BY ID
// ============================================================

export const getJobById = async (
  garageId: string,
  jobId: string
) => {
  const result = await db.send(
    new GetItemCommand({
      TableName: JOBS_TABLE,

      Key: marshall({
        jobId,
      }),
    })
  )

  if (!result.Item) {
    return null
  }

  const job = unmarshall(
    result.Item
  )

  if (job.garageId !== garageId) {
    return null
  }

  return job
}

// ============================================================
// UPDATE JOB
// ============================================================

export const updateJob = async (
  garageId: string,
  jobId: string,
  data: any
) => {
  // ----------------------------------------------------------
  // LOAD EXISTING JOB
  // ----------------------------------------------------------

  const existing = await getJobById(
    garageId,
    jobId
  )

  if (!existing) {
    return null
  }

  // ----------------------------------------------------------
  // OLD / NEW AMOUNT
  // ----------------------------------------------------------

  const oldTotalAmount = Number(
    existing.totalAmount || 0
  )

  const newTotalAmount = Number(
    data.totalAmount ??
      existing.totalAmount ??
      0
  )

  // ----------------------------------------------------------
  // CUSTOMER RESOLUTION
  // ----------------------------------------------------------

  let newCustomer: any = null

  const requestedCustomerId =
    data.customerId || null

  if (requestedCustomerId) {
    const customerResult =
      await db.send(
        new GetItemCommand({
          TableName: CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              requestedCustomerId,
          }),
        })
      )

    if (!customerResult.Item) {
      throw new Error(
        "Customer not found"
      )
    }

    newCustomer =
      unmarshall(
        customerResult.Item
      )

    if (
      newCustomer.garageId !==
      garageId
    ) {
      throw new Error(
        "Customer does not belong to this garage"
      )
    }
  } else {
    const phone =
      normalizePhone(
        data.phone ||
          existing.phone
      )

    if (!phone) {
      throw new Error(
        "Customer phone number is required"
      )
    }

    newCustomer =
      await findCustomerByPhone(
        garageId,
        phone
      )

    // If the frontend does not provide a
    // customerId but the phone belongs to
    // the existing customer, use that customer.
    //
    // Otherwise create a new customer.
    if (!newCustomer) {
      newCustomer = {
        customerId: uuid(),
        garageId,

        name:
          data.customerName ||
          "",

        phone,

        alternatePhone: "",
        address:
          data.customerAddress ||
          "",
        notes: "",

        totalVehicles: 0,
        totalJobs: 0,
        totalSpent: 0,
        pendingAmount: 0,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      }
    }
  }

  const oldCustomerId =
    existing.customerId || null

  const newCustomerId =
    newCustomer.customerId

  const customerChanged =
    String(oldCustomerId || "") !==
    String(newCustomerId || "")

  // ----------------------------------------------------------
  // NORMALIZE NEW PARTS
  // ----------------------------------------------------------

  const normalizedNewParts =
    normalizeParts(
      data.parts || []
    )

  // ----------------------------------------------------------
  // NORMALIZE OLD PARTS
  // ----------------------------------------------------------

  const normalizedOldParts =
    normalizeParts(
      existing.parts || []
    )

  const oldPartsMap =
    new Map<string, any>()

  for (const part of normalizedOldParts) {
    oldPartsMap.set(
      String(part.partId),
      part
    )
  }

  const newPartsMap =
    new Map<string, any>()

  for (const part of normalizedNewParts) {
    newPartsMap.set(
      String(part.partId),
      part
    )
  }

  // ----------------------------------------------------------
  // FIND INVENTORY CHANGES
  // ----------------------------------------------------------

  const inventoryIds =
    new Set<string>()

  for (const id of oldPartsMap.keys()) {
    inventoryIds.add(id)
  }

  for (const id of newPartsMap.keys()) {
    inventoryIds.add(id)
  }

  const inventoryChanges: any[] = []

  for (const inventoryId of inventoryIds) {
    const oldQuantity =
      Number(
        oldPartsMap.get(
          inventoryId
        )?.quantity || 0
      )

    const newQuantity =
      Number(
        newPartsMap.get(
          inventoryId
        )?.quantity || 0
      )

    const difference =
      newQuantity - oldQuantity

    if (difference !== 0) {
      inventoryChanges.push({
        inventoryId,
        oldQuantity,
        newQuantity,
        difference,

        partName:
          newPartsMap.get(
            inventoryId
          )?.name ||
          oldPartsMap.get(
            inventoryId
          )?.name ||
          inventoryId,
      })
    }
  }

  // ----------------------------------------------------------
  // LOAD INVENTORY + VALIDATE STOCK
  // ----------------------------------------------------------

  for (const change of inventoryChanges) {
    const inventoryResult =
      await db.send(
        new GetItemCommand({
          TableName: INVENTORY_TABLE,

          Key: marshall({
            partId:
              change.inventoryId,
          }),
        })
      )

    if (!inventoryResult.Item) {
      throw new Error(
        `Inventory item not found: ${change.partName}`
      )
    }

    const inventory =
      unmarshall(
        inventoryResult.Item
      )

    if (
      inventory.garageId !==
      garageId
    ) {
      throw new Error(
        `Inventory item does not belong to this garage: ${change.partName}`
      )
    }

    const availableStock =
      Number(
        inventory.stock || 0
      )

    // Positive difference means the job
    // needs additional stock.
    if (
      change.difference > 0 &&
      availableStock <
        change.difference
    ) {
      throw new InsufficientStockError(
        change.partName,
        availableStock,
        change.difference
      )
    }
  }

  // ----------------------------------------------------------
  // PREPARE UPDATED JOB
  // ----------------------------------------------------------

  const now =
    new Date().toISOString()

  const updatedJob = {
    ...existing,

    ...data,

    jobId,
    garageId,

    customerId:
      newCustomerId,

    customerName:
      data.customerName ??
      newCustomer.name ??
      existing.customerName ??
      "",

    phone:
      normalizePhone(
        data.phone ??
          newCustomer.phone ??
          existing.phone
      ),

    customerAddress:
      data.customerAddress ??
      newCustomer.address ??
      existing.customerAddress ??
      "",

    totalAmount:
      newTotalAmount,

    services:
      Array.isArray(data.services)
        ? data.services
        : existing.services || [],

    parts:
      normalizedNewParts,

    updatedAt: now,
  }

  // Never allow frontend data to change ownership.
  updatedJob.garageId =
    existing.garageId

  // ----------------------------------------------------------
  // BUILD TRANSACTION
  // ----------------------------------------------------------

  const transactItems: any[] = []

  // ----------------------------------------------------------
  // JOB
  // ----------------------------------------------------------

  transactItems.push({
    Put: {
      TableName: JOBS_TABLE,

      Item: marshall(updatedJob, {
        removeUndefinedValues: true,
      }),

      ConditionExpression:
        "attribute_exists(jobId) AND garageId = :garageId",

      ExpressionAttributeValues:
        marshall({
          ":garageId": garageId,
        }),
    },
  })

  // ----------------------------------------------------------
  // CUSTOMER CHANGED
  // ----------------------------------------------------------

  if (customerChanged) {
    // --------------------------------------------------------
    // OLD CUSTOMER
    // --------------------------------------------------------

    if (oldCustomerId) {
      const oldCustomerResult =
        await db.send(
          new GetItemCommand({
            TableName: CUSTOMERS_TABLE,

            Key: marshall({
              customerId:
                oldCustomerId,
            }),
          })
        )

      if (!oldCustomerResult.Item) {
        throw new Error(
          "Original customer not found"
        )
      }

      const oldCustomer =
        unmarshall(
          oldCustomerResult.Item
        )

      if (
        oldCustomer.garageId !==
        garageId
      ) {
        throw new Error(
          "Original customer does not belong to this garage"
        )
      }

      const oldTotalJobs =
        Number(
          oldCustomer.totalJobs || 0
        )

      const oldTotalSpent =
        Number(
          oldCustomer.totalSpent || 0
        )

      const oldPending =
        Number(
          oldCustomer.pendingAmount || 0
        )

      transactItems.push({
        Update: {
          TableName:
            CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              oldCustomerId,
          }),

          UpdateExpression:
            "SET totalJobs = :totalJobs, totalSpent = :totalSpent, pendingAmount = :pendingAmount, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(customerId) AND garageId = :garageId AND totalJobs = :oldTotalJobs AND totalSpent = :oldTotalSpent AND pendingAmount = :oldPending",

          ExpressionAttributeValues:
            marshall({
              ":totalJobs":
                Math.max(
                  0,
                  oldTotalJobs - 1
                ),

              ":totalSpent":
                Math.max(
                  0,
                  oldTotalSpent -
                    oldTotalAmount
                ),

              ":pendingAmount":
                Math.max(
                  0,
                  oldPending -
                    oldTotalAmount
                ),

              ":updatedAt":
                now,

              ":garageId":
                garageId,

              ":oldTotalJobs":
                oldTotalJobs,

              ":oldTotalSpent":
                oldTotalSpent,

              ":oldPending":
                oldPending,
            }),
        },
      })
    }

    // --------------------------------------------------------
    // NEW CUSTOMER
    // --------------------------------------------------------

    const newCustomerExists =
      await db.send(
        new GetItemCommand({
          TableName:
            CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              newCustomerId,
          }),
        })
      )

    if (!newCustomerExists.Item) {
      const customerToCreate = {
        ...newCustomer,

        garageId,

        totalJobs: 1,
        totalSpent:
          newTotalAmount,
        pendingAmount:
          newTotalAmount,

        updatedAt: now,
      }

      transactItems.push({
        Put: {
          TableName:
            CUSTOMERS_TABLE,

          Item: marshall(
            customerToCreate,
            {
              removeUndefinedValues:
                true,
            }
          ),

          ConditionExpression:
            "attribute_not_exists(customerId)",
        },
      })
    } else {
      const existingNewCustomer =
        unmarshall(
          newCustomerExists.Item
        )

      if (
        existingNewCustomer.garageId !==
        garageId
      ) {
        throw new Error(
          "New customer does not belong to this garage"
        )
      }

      const oldTotalJobs =
        Number(
          existingNewCustomer.totalJobs ||
            0
        )

      const oldTotalSpent =
        Number(
          existingNewCustomer.totalSpent ||
            0
        )

      const oldPending =
        Number(
          existingNewCustomer.pendingAmount ||
            0
        )

      transactItems.push({
        Update: {
          TableName:
            CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              newCustomerId,
          }),

          UpdateExpression:
            "SET totalJobs = :totalJobs, totalSpent = :totalSpent, pendingAmount = :pendingAmount, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(customerId) AND garageId = :garageId AND totalJobs = :oldTotalJobs AND totalSpent = :oldTotalSpent AND pendingAmount = :oldPending",

          ExpressionAttributeValues:
            marshall({
              ":totalJobs":
                oldTotalJobs + 1,

              ":totalSpent":
                oldTotalSpent +
                newTotalAmount,

              ":pendingAmount":
                oldPending +
                newTotalAmount,

              ":updatedAt":
                now,

              ":garageId":
                garageId,

              ":oldTotalJobs":
                oldTotalJobs,

              ":oldTotalSpent":
                oldTotalSpent,

              ":oldPending":
                oldPending,
            }),
        },
      })
    }
  } else {
    // --------------------------------------------------------
    // SAME CUSTOMER
    // --------------------------------------------------------

    if (!newCustomerId) {
      throw new Error(
        "Customer ID is missing"
      )
    }

    const oldTotalJobs =
      Number(
        newCustomer.totalJobs || 0
      )

    const oldTotalSpent =
      Number(
        newCustomer.totalSpent || 0
      )

    const oldPending =
      Number(
        newCustomer.pendingAmount || 0
      )

    const amountDifference =
      newTotalAmount -
      oldTotalAmount

    transactItems.push({
      Update: {
        TableName:
          CUSTOMERS_TABLE,

        Key: marshall({
          customerId:
            newCustomerId,
        }),

        UpdateExpression:
          "SET totalSpent = :totalSpent, pendingAmount = :pendingAmount, updatedAt = :updatedAt",

        ConditionExpression:
          "attribute_exists(customerId) AND garageId = :garageId AND totalJobs = :oldTotalJobs AND totalSpent = :oldTotalSpent AND pendingAmount = :oldPending",

        ExpressionAttributeValues:
          marshall({
            ":totalSpent":
              Math.max(
                0,
                oldTotalSpent +
                  amountDifference
              ),

            ":pendingAmount":
              Math.max(
                0,
                oldPending +
                  amountDifference
              ),

            ":updatedAt":
              now,

            ":garageId":
              garageId,

            ":oldTotalJobs":
              oldTotalJobs,

            ":oldTotalSpent":
              oldTotalSpent,

            ":oldPending":
              oldPending,
          }),
      },
    })
  }

  // ----------------------------------------------------------
  // INVENTORY CHANGES
  // ----------------------------------------------------------

  for (const change of inventoryChanges) {
    if (change.difference > 0) {
      // Job quantity increased.
      // Remove additional stock.

      transactItems.push({
        Update: {
          TableName:
            INVENTORY_TABLE,

          Key: marshall({
            partId:
              change.inventoryId,
          }),

          UpdateExpression:
            "SET stock = stock - :quantity, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(partId) AND garageId = :garageId AND stock >= :quantity",

          ExpressionAttributeValues:
            marshall({
              ":quantity":
                change.difference,

              ":updatedAt":
                now,

              ":garageId":
                garageId,
            }),
        },
      })
    } else {
      // Job quantity decreased.
      // Return stock to inventory.

      transactItems.push({
        Update: {
          TableName:
            INVENTORY_TABLE,

          Key: marshall({
            partId:
              change.inventoryId,
          }),

          UpdateExpression:
            "SET stock = stock + :quantity, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(partId) AND garageId = :garageId",

          ExpressionAttributeValues:
            marshall({
              ":quantity":
                Math.abs(
                  change.difference
                ),

              ":updatedAt":
                now,

              ":garageId":
                garageId,
            }),
        },
      })
    }
  }

  // ----------------------------------------------------------
  // EXECUTE EVERYTHING ATOMICALLY
  // ----------------------------------------------------------

  try {
    await db.send(
      new TransactWriteItemsCommand({
        TransactItems: transactItems,
      })
    )

    return updatedJob
  } catch (error: any) {
    if (
      error?.name ===
      "TransactionCanceledException"
    ) {
      throw error
    }

    throw error
  }
}

// ============================================================
// ASSIGN WORKER
// ============================================================

export const assignWorker = async (
  garageId: string,
  jobId: string,
  workerId: string
) => {
  const existing =
    await getJobById(
      garageId,
      jobId
    )

  if (!existing) {
    throw new Error(
      "Job not found"
    )
  }

  const now =
    new Date().toISOString()

  await db.send(
    new UpdateItemCommand({
      TableName: JOBS_TABLE,

      Key: marshall({
        jobId,
      }),

      UpdateExpression:
        "SET workerId = :workerId, updatedAt = :updatedAt",

      ConditionExpression:
        "attribute_exists(jobId) AND garageId = :garageId",

      ExpressionAttributeValues:
        marshall({
          ":workerId":
            workerId || null,

          ":updatedAt":
            now,

          ":garageId":
            garageId,
        }),
    })
  )
}

// ============================================================
// UPDATE STATUS
// ============================================================

export const updateJobStatus = async (
  garageId: string,
  jobId: string,
  status: string
) => {
  const existing =
    await getJobById(
      garageId,
      jobId
    )

  if (!existing) {
    throw new Error(
      "Job not found"
    )
  }

  const oldStatus =
    String(
      existing.status || ""
    ).toLowerCase()

  const newStatus =
    String(
      status || ""
    ).toLowerCase()

  const now =
    new Date().toISOString()

  const updatedJob = {
    ...existing,

    status,

    updatedAt: now,

    // Keep a separate completion timestamp.
    // This will be useful for service reminders,
    // invoices and reports later.
    ...(newStatus === "completed"
      ? {
          completedAt:
            existing.completedAt ||
            now,
        }
      : {}),
  }

  await db.send(
    new UpdateItemCommand({
      TableName: JOBS_TABLE,

      Key: marshall({
        jobId,
      }),

      UpdateExpression:
        "SET #status = :status, updatedAt = :updatedAt" +
        (
          newStatus === "completed"
            ? ", completedAt = :completedAt"
            : ""
        ),

      ConditionExpression:
        "attribute_exists(jobId) AND garageId = :garageId",

      ExpressionAttributeNames: {
        "#status": "status",
      },

      ExpressionAttributeValues:
        marshall({
          ":status":
            status,

          ":updatedAt":
            now,

          ":garageId":
            garageId,

          ...(newStatus === "completed"
            ? {
                ":completedAt":
                  existing.completedAt ||
                  now,
              }
            : {}),
        }),
      })
  )

  // ----------------------------------------------------------
  // CREATE NOTIFICATIONS ONLY WHEN THE JOB ACTUALLY BECOMES
  // COMPLETED
  // ----------------------------------------------------------

  if (
    oldStatus !== "completed" &&
    newStatus === "completed"
  ) {
    const completedJob = {
      ...updatedJob,

      status,
    }

    // Import at the top of this file:
    //
    // import {
    //   handleJobCompleted
    // } from "./notification.service"

    await handleJobCompleted(
      garageId,
      completedJob
    )
  }

  return updatedJob
}

// ============================================================
// DELETE JOB
// ============================================================

export const deleteJob = async (
  garageId: string,
  jobId: string
) => {
  const existing =
    await getJobById(
      garageId,
      jobId
    )

  if (!existing) {
    return false
  }

  /*
   * Important:
   *
   * Deleting a job should also return its
   * inventory and reverse customer statistics.
   *
   * This implementation keeps delete atomic too.
   */

  const oldTotalAmount =
    Number(
      existing.totalAmount || 0
    )

  const oldCustomerId =
    existing.customerId || null

  const oldParts =
    normalizeParts(
      existing.parts || []
    )

  const now =
    new Date().toISOString()

  const transactItems: any[] = []

  // ----------------------------------------------------------
  // DELETE JOB
  // ----------------------------------------------------------

  transactItems.push({
    Delete: {
      TableName: JOBS_TABLE,

      Key: marshall({
        jobId,
      }),

      ConditionExpression:
        "attribute_exists(jobId) AND garageId = :garageId",

      ExpressionAttributeValues:
        marshall({
          ":garageId": garageId,
        }),
    },
  })

  // ----------------------------------------------------------
  // RETURN INVENTORY
  // ----------------------------------------------------------

  for (const part of oldParts) {
    transactItems.push({
      Update: {
        TableName:
          INVENTORY_TABLE,

        Key: marshall({
          partId:
            part.partId,
        }),

        UpdateExpression:
          "SET stock = stock + :quantity, updatedAt = :updatedAt",

        ConditionExpression:
          "attribute_exists(partId) AND garageId = :garageId",

        ExpressionAttributeValues:
          marshall({
            ":quantity":
              Number(part.quantity),

            ":updatedAt":
              now,

            ":garageId":
              garageId,
          }),
      },
    })
  }

  // ----------------------------------------------------------
  // REVERSE CUSTOMER STATS
  // ----------------------------------------------------------

  if (oldCustomerId) {
    const customerResult =
      await db.send(
        new GetItemCommand({
          TableName:
            CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              oldCustomerId,
          }),
        })
      )

    if (customerResult.Item) {
      const customer =
        unmarshall(
          customerResult.Item
        )

      if (
        customer.garageId !==
        garageId
      ) {
        throw new Error(
          "Customer does not belong to this garage"
        )
      }

      const totalJobs =
        Number(
          customer.totalJobs || 0
        )

      const totalSpent =
        Number(
          customer.totalSpent || 0
        )

      const pendingAmount =
        Number(
          customer.pendingAmount || 0
        )

      transactItems.push({
        Update: {
          TableName:
            CUSTOMERS_TABLE,

          Key: marshall({
            customerId:
              oldCustomerId,
          }),

          UpdateExpression:
            "SET totalJobs = :totalJobs, totalSpent = :totalSpent, pendingAmount = :pendingAmount, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(customerId) AND garageId = :garageId",

          ExpressionAttributeValues:
            marshall({
              ":totalJobs":
                Math.max(
                  0,
                  totalJobs - 1
                ),

              ":totalSpent":
                Math.max(
                  0,
                  totalSpent -
                    oldTotalAmount
                ),

              ":pendingAmount":
                Math.max(
                  0,
                  pendingAmount -
                    oldTotalAmount
                ),

              ":updatedAt":
                now,

              ":garageId":
                garageId,
            }),
        },
      })
    }
  }

  await db.send(
    new TransactWriteItemsCommand({
      TransactItems:
        transactItems,
    })
  )

  return true
}