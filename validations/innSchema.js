import Joi from "joi";

const innSchema = Joi.string()
.min(10)
.max(12)
.pattern(/^\d{10}$|^\d{12}$/)
.required()

export default innSchema;