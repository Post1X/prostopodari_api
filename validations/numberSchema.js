import Joi from "joi";

const numberSchema = Joi.string()
    .min(1)
    .pattern(/^((\+7|7|8)+([0-9]){10})$/)
    .required()

export default numberSchema;