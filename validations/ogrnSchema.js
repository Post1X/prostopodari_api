import Joi from "joi";

const ogrnSchema = Joi.string()
    .min(1)
    .max(13)
    .pattern(/^\d{13}$/)
    .required()

export default ogrnSchema;