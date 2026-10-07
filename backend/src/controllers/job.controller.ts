import { Request, Response } from "express"

import * as JobService from "../services/job.service"

// ============================================================
// CREATE
// ============================================================

export const createJob = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
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
      job,
    })
  } catch (error: any) {
    console.error(
      "CREATE JOB ERROR:",
      error
    )

    if (
      error?.code ===
      "JOB_LIMIT_REACHED"
    ) {
      return res.status(403).json({
        code: "JOB_LIMIT_REACHED",

        message:
          "Monthly job limit reached. Please upgrade your plan or purchase additional job capacity.",
      })
    }

    if (
      error?.code ===
      "INSUFFICIENT_STOCK"
    ) {
      return res.status(409).json({
        code:
          "INSUFFICIENT_STOCK",

        message:
          error.message,

        partName:
          error.partName,

        available:
          error.available,

        requested:
          error.requested,
      })
    }

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create job",
    })
  }
}

// ============================================================
// GET ALL
// ============================================================

export const getJobs = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
      })
    }

    const jobs =
      await JobService.getJobs(
        garageId
      )

    return res.json({
      jobs,
    })
  } catch (error: any) {
    console.error(
      "GET JOBS ERROR:",
      error
    )

    return res.status(500).json({
      message:
        "Failed to fetch jobs",
    })
  }
}

// ============================================================
// GET BY ID
// ============================================================

export const getJobById = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
      })
    }

    const job =
      await JobService.getJobById(
        garageId,
        req.params.jobId
      )

    if (!job) {
      return res.status(404).json({
        message:
          "Job not found",
      })
    }

    return res.json({
      job,
    })
  } catch (error) {
    console.error(
      "GET JOB ERROR:",
      error
    )

    return res.status(500).json({
      message:
        "Failed to fetch job",
    })
  }
}

// ============================================================
// UPDATE JOB
// ============================================================

export const updateJob = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
      })
    }

    const job =
      await JobService.updateJob(
        garageId,
        req.params.jobId,
        req.body
      )

    if (!job) {
      return res.status(404).json({
        message:
          "Job not found",
      })
    }

    return res.json({
      message:
        "Job updated successfully",
      job,
    })
  } catch (error: any) {
    console.error(
      "UPDATE JOB ERROR:",
      error
    )

    if (
      error?.code ===
      "INSUFFICIENT_STOCK"
    ) {
      return res.status(409).json({
        code:
          "INSUFFICIENT_STOCK",

        message:
          error.message,

        partName:
          error.partName,

        available:
          error.available,

        requested:
          error.requested,
      })
    }

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to update job",
    })
  }
}

// ============================================================
// ASSIGN WORKER
// ============================================================

export const assignWorker = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
      })
    }

    await JobService.assignWorker(
      garageId,
      req.params.jobId,
      req.body.workerId
    )

    return res.json({
      message:
        "Worker assigned successfully",
    })
  } catch (error: any) {
    console.error(
      "ASSIGN WORKER ERROR:",
      error
    )

    if (
      error?.message ===
      "Job not found"
    ) {
      return res.status(404).json({
        message:
          "Job not found",
      })
    }

    return res.status(500).json({
      message:
        "Failed to assign worker",
    })
  }
}

// ============================================================
// UPDATE STATUS
// ============================================================

export const updateJobStatus = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
      })
    }

    const job =
      await JobService.updateJobStatus(
        garageId,
        req.params.jobId,
        req.body.status
      )

    return res.json({
      message:
        "Status updated successfully",

      job,
    })
  } catch (error: any) {
    console.error(
      "UPDATE STATUS ERROR:",
      error
    )

    if (
      error?.message ===
      "Job not found"
    ) {
      return res.status(404).json({
        message:
          "Job not found",
      })
    }

    return res.status(500).json({
      message:
        "Failed to update status",
    })
  }
}

// ============================================================
// DELETE
// ============================================================

export const deleteJob = async (
  req: any,
  res: Response
) => {
  try {
    const garageId =
      req.user?.garageId

    if (!garageId) {
      return res.status(401).json({
        message:
          "Garage not found for current user",
      })
    }

    const deleted =
      await JobService.deleteJob(
        garageId,
        req.params.jobId
      )

    if (!deleted) {
      return res.status(404).json({
        message:
          "Job not found",
      })
    }

    return res.json({
      message:
        "Job deleted successfully",
    })
  } catch (error: any) {
    console.error(
      "DELETE JOB ERROR:",
      error
    )

    return res.status(500).json({
      message:
        "Failed to delete job",
    })
  }
}