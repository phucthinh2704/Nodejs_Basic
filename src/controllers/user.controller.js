import { internalServerError } from "../middlewares/handle_error";
import * as services from "../services";

export const getCurrentUser = async (req, res) => {
	try {
		const { id } = req.user;
		const response = await services.getOne(id);
		return res.status(200).json(response);
	} catch (error) {
		console.log(error);
		return internalServerError(res);
	}
};

module.exports = { getCurrentUser };
