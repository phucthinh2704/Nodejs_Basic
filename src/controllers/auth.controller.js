import { badRequest, internalServerError } from "../middlewares/handle_error";
import * as services from "../services";
import { email, password, refresh_token } from "../helpers/joi_schema";
import Joi from "joi";

export const registerController = async (req, res) => {
	try {
		const { error } = Joi.object({ email, password }).validate(req.body);
		if (error) {
			return badRequest(error.details[0]?.message, res);
		}
		const response = await services.register(req.body);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return internalServerError(res);
	}
};

export const loginController = async (req, res) => {
	try {
		const { err } = Joi.object({ email, password }).validate(req.body);
		if (err) {
			return badRequest(err.details[0].message, res);
		}

		const response = await services.login(req.body);
		return res.status(200).json(response);
	} catch (error) {
		return internalServerError(res);
	}
};

export const refreshTokenController = async (req, res) => {
	try {
		const { err } = Joi.object({ refresh_token }).validate(req.body);
		if (err) {
			return badRequest(err.details[0].message, res);
		}

		const response = await services.refreshToken(req.body);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return internalServerError(res);
	}
};
