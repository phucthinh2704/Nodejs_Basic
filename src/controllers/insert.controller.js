import { internalServerError } from "../middlewares/handle_error";
import * as services from "../services";
import { books } from "../../books.json";

const genres = [
	"Travel",
	"historicalFiction",
	"mystery",
	"autobiography",
	"fiction",
	"philosophy",
	"business",
	"fantasy",
	"poetry",
];
export const insertDataCategory = async (req, res) => {
	try {
		const response = await services.insertDataCategory(genres);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return internalServerError(res);
	}
};

export const insertDataBook = async (req, res) => {
	try {
		const response = await services.insertDataBook(books, genres);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return internalServerError(res);
	}
};

module.exports = { insertDataCategory, insertDataBook };
