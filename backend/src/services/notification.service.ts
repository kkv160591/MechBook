import {
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb"

import {
  marshall,
  unmarshall,
} from "@aws-sdk/util-dynamodb"

import { v4 as uuid } from "uuid"

import { db } from "../config/dynamodb"

const NOTIFICATIONS_TABLE =
  process.env.NOTIFICATIONS_TABLE_NAME ||
  "Notifications"

const GARAGES_TABLE =
  process.env.GARAGES_TABLE_NAME ||
  "Garages"

const SETTINGS_TABLE =
  process.env.SETTINGS_TABLE_NAME ||
  "GarageSettings"

// ============================================================
// TYPES
// ============================================================

interface NotificationSettings {
  enabled: boolean

  customer: {
    enabled: boolean
    daysBeforeDue: number
    kmBeforeDue: number
  }

  garageOwner: {
    enabled: boolean
    daysBeforeDue: number
    kmBeforeDue: number
  }

  vehicleRules: {
    vehicleType: string
    serviceIntervalMonths: number
    serviceIntervalKm: number
  }[]
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,

  customer: {
    enabled: true,
    daysBeforeDue: 30,
    kmBeforeDue: 500,
  },

  garageOwner: {
    enabled: true,
    daysBeforeDue: 30,
    kmBeforeDue: 500,
  },

  vehicleRules: [
    {
      vehicleType: "CAR",
      serviceIntervalMonths: 12,
      serviceIntervalKm: 10000,
    },
    {
      vehicleType: "BIKE",
      serviceIntervalMonths: 6,
      serviceIntervalKm: 5000,
    },
    {
      vehicleType: "SUV",
      serviceIntervalMonths: 12,
      serviceIntervalKm: 10000,
    },
    {
      vehicleType: "COMMERCIAL",
      serviceIntervalMonths: 6,
      serviceIntervalKm: 5000,
    },
  ],
}

// ============================================================
// HELPERS
// ============================================================

const normalizeVehicleType = (
  vehicleType: any
) => {
  const value = String(
    vehicleType || ""
  )
    .trim()
    .toUpperCase()

  if (
    value === "BIKE" ||
    value === "2 WHEELER" ||
    value === "TWO WHEELER" ||
    value === "MOTORCYCLE" ||
    value === "SCOOTER"
  ) {
    return "BIKE"
  }

  if (
    value === "CAR" ||
    value === "4 WHEELER" ||
    value === "FOUR WHEELER"
  ) {
    return "CAR"
  }

  if (value === "SUV") {
    return "SUV"
  }

  if (
    value === "COMMERCIAL" ||
    value === "COMMERCIAL VEHICLE"
  ) {
    return "COMMERCIAL"
  }

  // Your existing job defaults to "2 Wheeler".
  return "BIKE"
}

const getOdometer = (job: any) => {
  const possibleValues = [
    job?.odometer,
    job?.currentKm,
    job?.vehicleKm,
    job?.mileage,
    job?.km,
  ]

  for (const value of possibleValues) {
    const number = Number(value)

    if (
      Number.isFinite(number) &&
      number > 0
    ) {
      return number
    }
  }

  return null
}

const addMonths = (
  date: Date,
  months: number
) => {
  const result = new Date(date)

  result.setMonth(
    result.getMonth() + months
  )

  return result
}

const subtractDays = (
  date: Date,
  days: number
) => {
  const result = new Date(date)

  result.setDate(
    result.getDate() - days
  )

  return result
}

const normalizeSettings = (
  data: any
): NotificationSettings => {
  return {
    enabled:
      data?.enabled !== false,

    customer: {
      enabled:
        data?.customer?.enabled !== false,

      daysBeforeDue:
        Number(
          data?.customer?.daysBeforeDue ?? 30
        ),

      kmBeforeDue:
        Number(
          data?.customer?.kmBeforeDue ?? 500
        ),
    },

    garageOwner: {
      enabled:
        data?.garageOwner?.enabled !== false,

      daysBeforeDue:
        Number(
          data?.garageOwner?.daysBeforeDue ?? 30
        ),

      kmBeforeDue:
        Number(
          data?.garageOwner?.kmBeforeDue ?? 500
        ),
    },

    vehicleRules:
      Array.isArray(data?.vehicleRules) &&
      data.vehicleRules.length > 0
        ? data.vehicleRules
        : DEFAULT_SETTINGS.vehicleRules,
  }
}

// ============================================================
// GET NOTIFICATION SETTINGS
// ============================================================

const getNotificationSettings = async (
  garageId: string
): Promise<NotificationSettings> => {
  try {
    const result = await db.send(
      new GetItemCommand({
        TableName: SETTINGS_TABLE,

        Key: marshall({
          garageId,
          settingType: "NOTIFICATIONS",
        }),
      })
    )

    if (!result.Item) {
      return DEFAULT_SETTINGS
    }

    return normalizeSettings(
      unmarshall(result.Item)
    )
  } catch (error) {
    console.error(
      "GET NOTIFICATION SETTINGS ERROR:",
      error
    )

    return DEFAULT_SETTINGS
  }
}

// ============================================================
// GET GARAGE OWNER
// ============================================================

const getGarageOwner = async (
  garageId: string
) => {
  const result = await db.send(
    new GetItemCommand({
      TableName: GARAGES_TABLE,

      Key: marshall({
        garageId,
      }),
    })
  )

  if (!result.Item) {
    return null
  }

  return unmarshall(result.Item)
}

// ============================================================
// CREATE NOTIFICATION
// ============================================================

const createNotification = async (
  notification: any
) => {
  const now =
    new Date().toISOString()

  const item = {
    notificationId:
      notification.notificationId ||
      uuid(),

    garageId:
      notification.garageId,

    recipientType:
      notification.recipientType,

    recipientUserId:
      notification.recipientUserId || null,

    recipientPhone:
      notification.recipientPhone || null,

    type:
      notification.type,

    jobId:
      notification.jobId || null,

    customerId:
      notification.customerId || null,

    vehicleNumber:
      notification.vehicleNumber || "",

    title:
      notification.title || "",

    message:
      notification.message || "",

    channel:
      notification.channel || "IN_APP",

    status:
      notification.status || "PENDING",

    scheduledAt:
      notification.scheduledAt || null,

    dueDate:
      notification.dueDate || null,

    dueKm:
      notification.dueKm ?? null,

    reminderKm:
      notification.reminderKm ?? null,

    readAt:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  }

  await db.send(
    new PutItemCommand({
      TableName:
        NOTIFICATIONS_TABLE,

      Item: marshall(item, {
        removeUndefinedValues: true,
      }),

      ConditionExpression:
        "attribute_not_exists(garageId) AND attribute_not_exists(notificationId)",
    })
  )

  return item
}

// ============================================================
// CREATE JOB COMPLETED NOTIFICATION
// ============================================================

const createJobCompletedNotification = async (
  garageId: string,
  job: any
) => {
  const owner =
    await getGarageOwner(garageId)

  if (!owner) {
    console.warn(
      `Garage owner not found for garage ${garageId}`
    )

    return null
  }

  const vehicleNumber =
    job.vehicleNumber ||
    "Vehicle"

  return createNotification({
    garageId,

    recipientType:
      "OWNER",

    recipientUserId:
      owner.userId ||
      garageId,

    type:
      "JOB_COMPLETED",

    jobId:
      job.jobId,

    customerId:
      job.customerId,

    vehicleNumber,

    title:
      "Job completed",

    message:
      `Job for ${vehicleNumber} has been completed.`,

    channel:
      "IN_APP",

    status:
      "UNREAD",
  })
}

// ============================================================
// CREATE SERVICE-DUE REMINDERS
// ============================================================

export const createServiceDueNotifications =
  async (
    garageId: string,
    job: any
  ) => {
    try {
      const settings =
        await getNotificationSettings(
          garageId
        )

      if (!settings.enabled) {
        console.log(
          "Notifications disabled for garage:",
          garageId
        )

        return []
      }

      const vehicleType =
        normalizeVehicleType(
          job.vehicleType
        )

      const vehicleRule =
        settings.vehicleRules.find(
          rule =>
            normalizeVehicleType(
              rule.vehicleType
            ) === vehicleType
        )

      if (!vehicleRule) {
        console.warn(
          "No notification vehicle rule found:",
          vehicleType
        )

        return []
      }

      const completedAt =
        new Date()

      const nextServiceDate =
        addMonths(
          completedAt,
          Number(
            vehicleRule.serviceIntervalMonths
          )
        )

      const odometer =
        getOdometer(job)

      const nextServiceKm =
        odometer !== null
          ? odometer +
            Number(
              vehicleRule.serviceIntervalKm
            )
          : null

      const notifications: any[] = []

      // --------------------------------------------------------
      // CUSTOMER
      // --------------------------------------------------------

      if (
        settings.customer.enabled &&
        job.phone
      ) {
        const reminderDate =
          subtractDays(
            nextServiceDate,
            Number(
              settings.customer.daysBeforeDue
            )
          )

        const reminderKm =
          nextServiceKm !== null
            ? nextServiceKm -
              Number(
                settings.customer.kmBeforeDue
              )
            : null

        const customerNotification =
          await createNotification({
            garageId,

            recipientType:
              "CUSTOMER",

            recipientPhone:
              job.phone,

            type:
              "SERVICE_DUE",

            jobId:
              job.jobId,

            customerId:
              job.customerId,

            vehicleNumber:
              job.vehicleNumber,

            title:
              "Vehicle service due",

            message:
              `Service for ${job.vehicleNumber || "your vehicle"} is due soon.`,

            channel:
              "SMS",

            status:
              "PENDING",

            scheduledAt:
              reminderDate.toISOString(),

            dueDate:
              nextServiceDate.toISOString(),

            dueKm:
              nextServiceKm,

            reminderKm,
          })

        notifications.push(
          customerNotification
        )
      }

      // --------------------------------------------------------
      // GARAGE OWNER
      // --------------------------------------------------------

      if (
        settings.garageOwner.enabled
      ) {
        const owner =
          await getGarageOwner(
            garageId
          )

        if (owner) {
          const reminderDate =
            subtractDays(
              nextServiceDate,
              Number(
                settings.garageOwner.daysBeforeDue
              )
            )

          const reminderKm =
            nextServiceKm !== null
              ? nextServiceKm -
                Number(
                  settings.garageOwner.kmBeforeDue
                )
              : null

          const ownerNotification =
            await createNotification({
              garageId,

              recipientType:
                "OWNER",

              recipientUserId:
                owner.userId ||
                garageId,

              type:
                "SERVICE_DUE",

              jobId:
                job.jobId,

              customerId:
                job.customerId,

              vehicleNumber:
                job.vehicleNumber,

              title:
                "Service reminder",

              message:
                `Service for ${job.vehicleNumber || "vehicle"} will be due soon.`,

              channel:
                "IN_APP",

              status:
                "PENDING",

              scheduledAt:
                reminderDate.toISOString(),

              dueDate:
                nextServiceDate.toISOString(),

              dueKm:
                nextServiceKm,

              reminderKm,
            })

          notifications.push(
            ownerNotification
          )
        }
      }

      console.log(
        `Created ${notifications.length} service notification(s) for job ${job.jobId}`
      )

      return notifications
    } catch (error) {
      // Notification failure should NOT make a successfully
      // completed job fail.
      console.error(
        "CREATE SERVICE DUE NOTIFICATIONS ERROR:",
        error
      )

      return []
    }
  }

// ============================================================
// JOB COMPLETION HANDLER
// ============================================================

export const handleJobCompleted =
  async (
    garageId: string,
    job: any
  ) => {
    console.log("job =>", job);
    try {
      // Immediate owner in-app notification
      await createJobCompletedNotification(
        garageId,
        job
      )

      // Future customer + owner service reminders
      await createServiceDueNotifications(
        garageId,
        job
      )
    } catch (error) {
      // Never fail job completion because
      // notification creation failed.
      console.error(
        "HANDLE JOB COMPLETED NOTIFICATION ERROR:",
        error
      )
    }
  }

  // ============================================================
// GET OWNER NOTIFICATIONS
// ============================================================

export const getOwnerNotifications = async (
  garageId: string,
  userId: string
) => {
  const result = await db.send(
    new QueryCommand({
      TableName: NOTIFICATIONS_TABLE,

      KeyConditionExpression:
        "garageId = :garageId",

      FilterExpression:
        "recipientUserId = :userId AND " +
        "(" +
        "#status = :unread OR " +
        "#status = :read OR " +
        "(" +
        "#status = :pending AND " +
        "attribute_exists(scheduledAt)" +
        ")" +
        ")",

      ExpressionAttributeNames: {
        "#status": "status",
      },

      ExpressionAttributeValues:
        marshall({
          ":garageId": garageId,
          ":userId": userId,
          ":unread": "UNREAD",
          ":read": "READ",
          ":pending": "PENDING",
        }),
    })
  )

  const now = Date.now()

  const notifications =
    (result.Items || [])
      .map(item => unmarshall(item))
      .filter((notification: any) => {
        // Future service reminders should not appear
        // until their scheduled time.
        if (
          notification.status === "PENDING" &&
          notification.scheduledAt
        ) {
          return (
            new Date(
              notification.scheduledAt
            ).getTime() <= now
          )
        }

        return true
      })

  notifications.sort(
    (a: any, b: any) => {
      const dateA = new Date(
        a.createdAt ||
        a.scheduledAt ||
        0
      ).getTime()

      const dateB = new Date(
        b.createdAt ||
        b.scheduledAt ||
        0
      ).getTime()

      return dateB - dateA
    }
  )

  return notifications
}

// ============================================================
// GET OWNER UNREAD COUNT
// ============================================================

export const getOwnerUnreadCount = async (
  garageId: string,
  userId: string
) => {
  const notifications =
    await getOwnerNotifications(
      garageId,
      userId
    )

  return notifications.filter(
    (notification: any) =>
      notification.status === "UNREAD"
  ).length
}

// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

export const markNotificationAsRead =
  async (
    garageId: string,
    userId: string,
    notificationId: string
  ) => {
    const result = await db.send(
      new UpdateItemCommand({
        TableName:
          NOTIFICATIONS_TABLE,

        Key: marshall({
          garageId,
          notificationId,
        }),

        UpdateExpression:
          "SET #status = :read, readAt = :readAt, updatedAt = :updatedAt",

        ConditionExpression:
          "attribute_exists(notificationId) AND recipientUserId = :userId",

        ExpressionAttributeNames: {
          "#status": "status",
        },

        ExpressionAttributeValues:
          marshall({
            ":read": "READ",
            ":readAt":
              new Date().toISOString(),
            ":updatedAt":
              new Date().toISOString(),
            ":userId": userId,
          }),
      })
    )

    return true
  }

// ============================================================
// MARK ALL OWNER NOTIFICATIONS AS READ
// ============================================================

export const markAllOwnerNotificationsAsRead =
  async (
    garageId: string,
    userId: string
  ) => {
    const notifications =
      await getOwnerNotifications(
        garageId,
        userId
      )

    const unread =
      notifications.filter(
        (notification: any) =>
          notification.status === "UNREAD"
      )

    for (const notification of unread) {
      await db.send(
        new UpdateItemCommand({
          TableName:
            NOTIFICATIONS_TABLE,

          Key: marshall({
            garageId,
            notificationId:
              notification.notificationId,
          }),

          UpdateExpression:
            "SET #status = :read, readAt = :readAt, updatedAt = :updatedAt",

          ConditionExpression:
            "attribute_exists(notificationId) AND recipientUserId = :userId AND #status = :unread",

          ExpressionAttributeNames: {
            "#status": "status",
          },

          ExpressionAttributeValues:
            marshall({
              ":read": "READ",

              ":unread": "UNREAD",

              ":readAt":
                new Date().toISOString(),

              ":updatedAt":
                new Date().toISOString(),

              ":userId":
                userId,
            }),
        })
      )
    }

    return unread.length
  }