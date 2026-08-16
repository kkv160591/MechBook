import {
  Request,
  Response
} from "express"

import * as JobService
  from "../services/job.service"


export const createJob =
async (
  req: any,
  res: Response
) => {

  try {

    const garageId =
      req.user.garageId


    if (!garageId) {

      return res.status(401).json({

        message:
          "Garage not found for current user"

      })

    }


    const job =
      await JobService.createJob(

        garageId,

        req.body

      )


    return res.status(201).json({

      message:
        "Job created successfully",

      job

    })

  }


  catch (error: any) {

    console.error(
      "CREATE JOB ERROR:",
      error
    )


    /*
     * -------------------------------------------------------------
     * PLAN LIMIT
     * -------------------------------------------------------------
     */

    if (
      error?.code ===
      "JOB_LIMIT_REACHED"
    ) {

      return res.status(403).json({

        code:
          "JOB_LIMIT_REACHED",

        message:
          "Monthly job limit reached. Please upgrade your plan or purchase additional job capacity."

      })

    }


    /*
     * -------------------------------------------------------------
     * SERVER ERROR
     * -------------------------------------------------------------
     */

    return res.status(500).json({

      message:
        "Failed to create job"

    })

  }

}


/*
|--------------------------------------------------------------------------
| GET JOBS
|--------------------------------------------------------------------------
*/

export const getJobs =
async (
  req: any,
  res: Response
) => {

  try {

    const garageId =
      req.user.garageId


    const jobs =
      await JobService.getJobs(
        garageId
      )


    return res.json({

      jobs

    })

  }


  catch (error) {

    console.error(
      error
    )


    return res.status(500).json({

      message:
        "Failed to fetch jobs"

    })

  }

}


/*
|--------------------------------------------------------------------------
| GET JOB BY ID
|--------------------------------------------------------------------------
*/

export const getJobById =
async (
  req: Request,
  res: Response
) => {

  try {

    const job =
      await JobService.getJobById(

        req.params.jobId as string

      )


    if (!job) {

      return res.status(404).json({

        message:
          "Job not found"

      })

    }


    return res.json({

      job

    })

  }


  catch (error) {

    console.error(
      error
    )


    return res.status(500).json({

      message:
        "Failed to fetch job"

    })

  }

}


/*
|--------------------------------------------------------------------------
| UPDATE JOB
|--------------------------------------------------------------------------
*/

export const updateJob =
async (
  req: Request,
  res: Response
) => {

  try {

    const job =
      await JobService.updateJob(

        req.params.jobId as string,

        req.body

      )


    if (!job) {

      return res.status(404).json({

        message:
          "Job not found"

      })

    }


    return res.json({

      message:
        "Job updated successfully",

      job

    })

  }


  catch (error) {

    console.error(
      error
    )


    return res.status(500).json({

      message:
        "Failed to update job"

    })

  }

}


/*
|--------------------------------------------------------------------------
| ASSIGN WORKER
|--------------------------------------------------------------------------
*/

export const assignWorker =
async (
  req: Request,
  res: Response
) => {

  try {

    await JobService.assignWorker(

      req.params.jobId as string,

      req.body.workerId

    )


    return res.json({

      message:
        "Worker assigned successfully"

    })

  }


  catch (error) {

    console.error(
      error
    )


    return res.status(500).json({

      message:
        "Failed to assign worker"

    })

  }

}


/*
|--------------------------------------------------------------------------
| UPDATE JOB STATUS
|--------------------------------------------------------------------------
*/

export const updateJobStatus =
async (
  req: Request,
  res: Response
) => {

  try {

    await JobService.updateJobStatus(

      req.params.jobId as string,

      req.body.status

    )


    return res.json({

      message:
        "Status updated successfully"

    })

  }


  catch (error) {

    console.error(
      error
    )


    return res.status(500).json({

      message:
        "Failed to update status"

    })

  }

}


/*
|--------------------------------------------------------------------------
| DELETE JOB
|--------------------------------------------------------------------------
*/

export const deleteJob =
async (
  req: Request,
  res: Response
) => {

  try {

    await JobService.deleteJob(

      req.params.jobId as string

    )


    return res.json({

      message:
        "Job deleted successfully"

    })

  }


  catch (error) {

    console.error(
      error
    )


    return res.status(500).json({

      message:
        "Failed to delete job"

    })

  }

}