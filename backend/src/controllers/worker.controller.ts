import {
  Request,
  Response
} from "express"

import {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  updateWorkerStatus,
  resetWorkerPin
} from "../services/worker.service"

export const createWorkerController =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      (req as any).user.garageId

    const worker =
      await createWorker(
        garageId,
        req.body
      )

    return res.status(201).json({

      success: true,

      worker

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to create worker"

    })

  }

}

export const getWorkersController =
async (
  req: Request,
  res: Response
) => {

  try {

    const garageId =
      (req as any).user.garageId

    const workers =
      await getWorkers(
        garageId
      )

    return res.json({

      success: true,

      workers

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch workers"

    })

  }

}

export const getWorkerController =
async (
  req: Request,
  res: Response
) => {

  try {

    const workerId = req.params.workerId as string
    const worker =
      await getWorkerById(workerId)

    if (!worker) {

      return res.status(404).json({

        success: false,

        message:
          "Worker not found"

      })

    }

    return res.json({

      success: true,

      worker

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch worker"

    })

  }

}

export const updateWorkerController =
async (
  req: Request,
  res: Response
) => {

  try {

    const workerId = req.params.workerId as string
    const worker =
      await updateWorker(

        workerId,

        req.body

      )

    return res.json({

      success: true,

      worker

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to update worker"

    })

  }

}

export const updateWorkerStatusController =
async (
  req: Request,
  res: Response
) => {

  try {

    const workerId = req.params.workerId as string
    await updateWorkerStatus(

      workerId,

      req.body.active

    )

    return res.json({

      success: true,

      message:
        "Worker status updated"

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to update status"

    })

  }

}

export const resetWorkerPinController =
async (
  req: Request,
  res: Response
) => {

  try {

    const workerId = req.params.workerId as string
    await resetWorkerPin(

      workerId,

      req.body.pin

    )

    return res.json({

      success: true,

      message:
        "PIN reset successfully"

    })

  }

  catch (error) {

    console.error(error)

    return res.status(500).json({

      success: false,

      message:
        "Failed to reset PIN"

    })

  }

}