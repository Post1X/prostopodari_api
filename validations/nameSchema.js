import Joi from "joi";

const nameSchema = Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[\p{L}][\p{L}\s'-]*$/u)
    .required();

export default nameSchema;