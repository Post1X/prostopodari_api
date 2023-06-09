import Joi from "joi";

const storeTitleSchema = Joi.string()
    .min(1)
    .max(20)
    .pattern(/^[a-zA-Zа-яА-Я0-9]{1,20}(?:\s[a-zA-Zа-яА-Я0-9]{1,20})?$/)
    .required()

export default storeTitleSchema;
