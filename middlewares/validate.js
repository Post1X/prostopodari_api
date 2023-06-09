import emailSchema from "../validations/emailSchema";
import nameSchema from "../validations/nameSchema";
import numberSchema from "../validations/numberSchema";
import passwordSchema from "../validations/passwordSchema";
import storeTitleSchema from "../validations/storeTitleSchema";
import ogrnSchema from "../validations/ogrnSchema";
import ipSchema from "../validations/ipSchema";
import innSchema from "../validations/innSchema";

import Joi from "joi";

export async function validateEmail(email) {
    try {
        const {error, value} = await emailSchema.validate(email);
        if (error) {
            throw new Error(error)
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validateName(full_name) {
    try {
        const {error, value} = await nameSchema.validate(full_name);
        if (error) {
            throw new Error(error)
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validateNumber(phone_number) {
    try {
        const {error, value} = await numberSchema.validate(phone_number);
        if (error) {
            throw new Error(error)
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validatePassword(password) {
    try {
        const {error, value} = await passwordSchema.validate(password);
        if (error) {
            throw new Error(error);
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validateStoreTitle(store_title) {
    try {
        const {error, value} = await storeTitleSchema.validate(store_title);
        if (error) {
            throw new Error(error);
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validateInn(inn) {
    try {
        const {error, value} = await innSchema.validate(inn);
        if (error) {
            throw new Error(error);
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validateOgrn(ogrn) {
    try {
        const {error, value} = await ogrnSchema.validate(ogrn);
        if (error) {
            throw new Error(error);
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}

export async function validateIp(ip) {
    try {
        const {error, value} = await ipSchema.validate(ip)
        if (error) {
            throw new Error(error);
        } else {
            return value;
        }
    } catch (e) {
        throw e;
    }
}
