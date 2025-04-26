import Joi from "joi";

export const email = Joi.string().pattern(new RegExp("@gmail.com$")).required();

export const password = Joi.string().min(6).required();

export const id = Joi.number().required();

export const book_ids = Joi.string().required();

export const title = Joi.string().required();

export const price = Joi.number().min(0).required();

export const available = Joi.number().min(0).required();

export const category_code = Joi.string().alphanum().required();

export const image = Joi.string().required();

export const filename = Joi.string().required();
