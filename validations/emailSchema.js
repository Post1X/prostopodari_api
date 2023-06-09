import Joi from "joi";

const emailSchema = Joi.string().email({
    minDomainSegments: 2,
    tlds: {allow: ['com', 'net', 'ru']}
});

export default emailSchema;