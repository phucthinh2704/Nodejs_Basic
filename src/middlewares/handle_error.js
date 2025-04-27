import createError from "http-errors";

export const badRequest = (err, res) => {
	const error = createError.BadRequest(err);
	return res.status(error.status).json({
		err: 1,
		mes: error.message,
	});
};

export const internalServerError = (res) => {
	const error = createError.InternalServerError();
	return res.status(error.status).json({
		err: -1,
		mes: error.message,
	});
};

export const notFound = (req, res) => {
	const error = createError.NotFound("Not Found Route");
	return res.status(error.status).json({
		err: 1,
		mes: error.message,
	});
};

export const notAuthorized = (err, res, isExpired) => {
	const error = createError.Unauthorized(err);
	return res.status(error.status).json({
		err: isExpired ? 2 : 1,
		mes: error.message,
	});
};
