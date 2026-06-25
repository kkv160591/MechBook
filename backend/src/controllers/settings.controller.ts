import {
  Request,
  Response
} from "express"

import * as settingsService
from "../services/settings.service"

const garageId =
  "garage-1"

export const getGST =
async (
  req: Request,
  res: Response
) => {

  const data =
    await settingsService.getSetting(
      garageId,
      "GST"
    )

  res.json(data)

}

export const updateGST =
async (
  req: Request,
  res: Response
) => {

  await settingsService.saveSetting(
    garageId,
    "GST",
    req.body
  )

  res.json({
    message:
      "GST settings updated"
  })

}

export const getInvoice =
async (
  req: Request,
  res: Response
) => {

  const data =
    await settingsService.getSetting(
      garageId,
      "INVOICE"
    )

  res.json(data)

}

export const updateInvoice =
async (
  req: Request,
  res: Response
) => {

  await settingsService.saveSetting(
    garageId,
    "INVOICE",
    req.body
  )

  res.json({
    message:
      "Invoice settings updated"
  })

}

export const getLanguage =
async (
  req: Request,
  res: Response
) => {

  const data =
    await settingsService.getSetting(
      garageId,
      "LANGUAGE"
    )

  res.json(data)

}

export const updateLanguage =
async (
  req: Request,
  res: Response
) => {

  await settingsService.saveSetting(
    garageId,
    "LANGUAGE",
    req.body
  )

  res.json({
    message:
      "Language updated"
  })

}

export const getBackup =
async (
  req: Request,
  res: Response
) => {

  const data =
    await settingsService.getSetting(
      garageId,
      "BACKUP"
    )

  res.json(data)

}

export const updateBackup =
async (
  req: Request,
  res: Response
) => {

  await settingsService.saveSetting(
    garageId,
    "BACKUP",
    req.body
  )

  res.json({
    message:
      "Backup settings updated"
  })

}

export const runBackup =
async (
  req: Request,
  res: Response
) => {

  const data =
    await settingsService.runBackup(
      garageId
    )

  res.json(data)

}

export const getPlan =
async (
  req: Request,
  res: Response
) => {

  const data =
    await settingsService.getSetting(
      garageId,
      "PLAN"
    )

  res.json(data)

}