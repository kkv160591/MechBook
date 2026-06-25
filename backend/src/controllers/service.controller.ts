import {
  Request,
  Response
} from "express"

import * as serviceService
from "../services/service.service"

export const createServiceType =
async (
  req: Request,
  res: Response
) => {

  const garageId =
    (req as any).user.garageId

  const service =
    await serviceService.createServiceType(
      garageId,
      req.body
    )

  res.json({
    success: true,
    service
  })

}

export const getServiceTypes =
async (
  req: Request,
  res: Response
) => {

  const garageId =
    (req as any).user.garageId

  const services =
    await serviceService.getServiceTypes(
      garageId
    )

  res.json({
    success: true,
    services
  })

}

export const getServiceTypeById =
async (
  req: Request,
  res: Response
) => {

  const service =
    await serviceService.getServiceTypeById(
      req.params.serviceTypeId as string
    )

  res.json({
    success: true,
    service
  })

}

export const updateServiceType =
async (
  req: Request,
  res: Response
) => {

  const service =
    await serviceService.updateServiceType(
      req.params.serviceTypeId as string,
      req.body
    )

  res.json({
    success: true,
    service
  })

}

export const deleteServiceType =
async (
  req: Request,
  res: Response
) => {

  await serviceService.deleteServiceType(
    req.params.serviceTypeId as string
  )

  res.json({
    success: true
  })

}