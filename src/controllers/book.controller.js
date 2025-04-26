import { badRequest, internalServerError } from "../middlewares/handle_error";
import * as services from "../services";
const cloudinary = require("cloudinary").v2;

import Joi from "joi";
import {
	available,
	category_code,
	image,
	price,
	title,
	id,
	book_ids,
} from "../helpers/joi_schema";

//	GET api/v1/books
export const getBooks = async (req, res) => {
	try {
		const response = await services.getBooks(req.query);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return internalServerError(res);
	}
};

//	POST api/v1/books
export const createNewBook = async (req, res) => {
	try {
		if (!req.body) {
			return badRequest("Missing body", res);
		}
		const fileData = req.file;
		const { error } = Joi.object({
			title,
			price,
			available,
			image,
			category_code,
		}).validate({ ...req.body, image: fileData?.path });
		if (error) {
			if (fileData) {
				await cloudinary.uploader.destroy(fileData.filename);
			}
			return badRequest(error.details[0].message, res);
		}
		const response = await services.createNewBook(req.body, fileData);
		return res.status(200).json(response);
	} catch (err) {
		console.log(err);
		return internalServerError(res);
	}
};

//	PUT api/v1/books
export const updateBook = async (req, res) => {
	try {
		const fileData = req.file;
		const { error } = Joi.object({ id }).validate({ id: req.body.id });
		if (error) {
			if (fileData) {
				await cloudinary.uploader.destroy(fileData.filename);
			}
			return badRequest(error.details[0].message, res);
		}
		const response = await services.updateBook(req.body, fileData);
		return res.status(200).json(response);
	} catch (err) {
		console.log(err);
		return internalServerError(res);
	}
};

//	DELETE api/v1/books
export const deleteBook = async (req, res) => {
	try {
		const { error } = Joi.object({ book_ids }).validate(req.query);
		if (error) {
			return badRequest(error.details[0].message, res);
		}
		// book_ids có dạng "1,2,3"
		// cần chuyển thành [1,2,3]
		const book_ids_array = req.query.book_ids.split(",").map(Number);
		const response = await services.deleteBook(book_ids_array);
		return res.status(200).json(response);
	} catch (err) {
		console.log(err);
		return internalServerError(res);
	}
};
module.exports = { getBooks, createNewBook, updateBook, deleteBook };
