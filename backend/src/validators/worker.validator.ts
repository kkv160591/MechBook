import Joi from "joi"

export const createWorkerSchema =
  Joi.object({

    name: Joi.string()
      .required(),

    role: Joi.string()
      .required(),

    phone: Joi.string()
      .required()

  })