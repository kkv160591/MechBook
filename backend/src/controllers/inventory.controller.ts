import { Request, Response } from "express"

import {

  createPart,
  getInventory,
  getPartById,
  updatePart,
  deletePart,
  getLowStockItems

} from "../services/inventory.service"

export const addPart =
async (
  req: any,
  res: Response
) => {

  try {

    const part =
      await createPart(
        req.user.garageId,
        req.body
      )

    res.status(201).json({
      success: true,
      part
    })

  }

  catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}

export const getParts =
async (
  req: any,
  res: Response
) => {

  const parts =
    await getInventory(
      req.user.garageId
    )

  res.json({
    success: true,
    parts
  })

}

export const getPart =
async (
  req: Request,
  res: Response
) => {

  const part =
    await getPartById(
      req.params.partId as string
    )

  res.json({
    success: true,
    part
  })

}

export const editPart =
async (
  req: Request,
  res: Response
) => {

  await updatePart(
    req.params.partId as string,
    req.body
  )

  res.json({
    success: true,
    message:
      "Part updated successfully"
  })

}

export const removePart =
async (
  req: Request,
  res: Response
) => {

  await deletePart(
    req.params.partId as string
  )

  res.json({
    success: true,
    message:
      "Part deleted successfully"
  })

}

export const lowStock =
async (
  req: any,
  res: Response
) => {

  const items =
    await getLowStockItems(
      req.user.garageId
    )

  res.json({
    success: true,
    items
  })

}