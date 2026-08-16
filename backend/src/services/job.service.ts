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


const JOBS_TABLE =
  process.env.JOBS_TABLE_NAME!

const SUBSCRIPTIONS_TABLE =
  process.env.SUBSCRIPTIONS_TABLE_NAME || "Subscriptions"


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
| CREATE JOB
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Job creation and subscription usage update
| happen inside ONE DynamoDB transaction.
|
| This prevents:
|
| 1. Job being created without jobsUsed increasing
| 2. jobsUsed increasing without a job
| 3. Two workers creating jobs beyond the plan limit
|
|--------------------------------------------------------------------------
*/

export const createJob =
async (
  garageId: string,
  data: any
) => {

  /*
   * ---------------------------------------------------------------
   * CREATE / GET SUBSCRIPTION
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
   *
   * The subscription can be changed by another request at the
   * same time.
   *
   * We use optimistic concurrency by checking that the subscription
   * values we read are still the same when the transaction executes.
   *
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


    /*
     * -------------------------------------------------------------
     * CALCULATE TOTAL AVAILABLE JOBS
     * -------------------------------------------------------------
     */

    const totalAvailable =
      jobLimit === -1
        ? -1
        : jobLimit + boosterJobs


    /*
     * -------------------------------------------------------------
     * CHECK PLAN LIMIT
     * -------------------------------------------------------------
     */

    if (
      totalAvailable !== -1 &&
      jobsUsed >= totalAvailable
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

      // Customer
      customerName:
        data.customerName || "",

      phone:
        data.phone || "",

      customerAddress:
        data.customerAddress || "",


      // Vehicle
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


      // Job
      status:
        "pending",

      workerId:
        data.workerId || null,

      priority:
        data.priority || "Normal",

      deliveryDate:
        data.deliveryDate || "",


      // Complaint
      complaint:
        data.complaint || "",


      // Inspection
      inspectionNotes:
        data.inspectionNotes || "",


      // Payment
      paymentStatus:
        data.paymentStatus || "Pending",

      paymentMethod:
        data.paymentMethod || "",


      // Notes
      notes:
        data.notes || "",


      // Services
      services:
        data.services || [],


      createdAt:
        now,

      updatedAt:
        now

    }


    /*
     * -------------------------------------------------------------
     * ATOMIC TRANSACTION
     * -------------------------------------------------------------
     *
     * Operation 1:
     *     Create Job
     *
     * Operation 2:
     *     Increment Subscription.jobsUsed
     *
     * Both must succeed.
     *
     */

    try {

      await db.send(

        new TransactWriteItemsCommand({

          TransactItems: [

            /*
             * ---------------------------------------------------
             * CREATE JOB
             * ---------------------------------------------------
             */

            {

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

                /*
                 * Prevent accidental overwrite if the UUID
                 * ever happens to collide.
                 */

                ConditionExpression:
                  "attribute_not_exists(jobId)"

              }

            },


            /*
             * ---------------------------------------------------
             * UPDATE SUBSCRIPTION
             * ---------------------------------------------------
             */

            {

              Update: {

                TableName:
                  SUBSCRIPTIONS_TABLE,

                Key: {

                  garageId: {

                    S:
                      garageId

                  }

                },


                UpdateExpression:
                  "SET jobsUsed = :newJobsUsed, updatedAt = :updatedAt",


                /*
                 * ------------------------------------------------
                 * OPTIMISTIC CONCURRENCY CHECK
                 * ------------------------------------------------
                 *
                 * Only update the subscription if the values we
                 * originally read are still current.
                 *
                 * This prevents two workers from both consuming
                 * the same final job slot.
                 */

                ConditionExpression:
                  "jobsUsed = :currentJobsUsed AND jobLimit = :currentJobLimit AND boosterJobs = :currentBoosterJobs",


                ExpressionAttributeValues: {

                  ":currentJobsUsed": {

                    N:
                      jobsUsed.toString()

                  },

                  ":currentJobLimit": {

                    N:
                      jobLimit.toString()

                  },

                  ":currentBoosterJobs": {

                    N:
                      boosterJobs.toString()

                  },

                  ":newJobsUsed": {

                    N:
                      (
                        jobsUsed + 1
                      ).toString()

                  },

                  ":updatedAt": {

                    S:
                      now

                  }

                }

              }

            }

          ]

        })

      )


      /*
       * -----------------------------------------------------------
       * SUCCESS
       * -----------------------------------------------------------
       */

      return item

    }


    catch (error: any) {

      /*
       * -----------------------------------------------------------
       * TRANSACTION CONFLICT
       * -----------------------------------------------------------
       *
       * Another request changed the subscription between our
       * initial read and transaction.
       *
       * Re-read it and try again.
       */

      if (
        error?.name ===
        "TransactionCanceledException"
      ) {

        subscription =
          await getOrCreateSubscription(
            garageId
          )

        /*
         * If the newly-read subscription is already full,
         * return the proper plan-limit error.
         */

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
         * Otherwise another update probably happened.
         * Retry the transaction with the latest subscription.
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


  /*
   * ---------------------------------------------------------------
   * SHOULD NOT REACH HERE
   * ---------------------------------------------------------------
   */

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
          JOBS_TABLE

      })

    )


  const jobs =
    (response.Items || [])
      .map(item =>
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
              jobId

          }

        }

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
      new Date().toISOString()

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
        )

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
            jobId

        }

      },

      UpdateExpression:
        "SET workerId = :workerId, updatedAt = :updatedAt",

      ExpressionAttributeValues: {

        ":workerId": {

          S:
            workerId

        },

        ":updatedAt": {

          S:
            new Date().toISOString()

        }

      }

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
            jobId

        }

      },

      UpdateExpression:
        "SET #status = :status, updatedAt = :updatedAt",

      ExpressionAttributeNames: {

        "#status":
          "status"

      },

      ExpressionAttributeValues: {

        ":status": {

          S:
            status

        },

        ":updatedAt": {

          S:
            new Date().toISOString()

        }

      }

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
            jobId

        }

      }

    })

  )

}