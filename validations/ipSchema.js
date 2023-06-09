import Joi from "joi";

const ipSchema = Joi.string()
    .min(10)
    .max(12)
    .pattern(/^\d{12}$/)
    .required()

export default ipSchema;