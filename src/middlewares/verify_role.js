import { notAuthorized } from "./handle_error";

export const isAdmin = (req, res, next) => {
	const { role_code } = req.user;
	if (role_code !== "R1") {
		return notAuthorized("Require admin role", res);
	}
	next();
};

export const isCreator = (req, res, next) => {
	const { role_code } = req.user;
	if (role_code !== "R1" && role_code !== "R2") {
		return notAuthorized("Require admin or creator role", res);
	}
	next();
};

export const isUser = (req, res, next) => {
	const { role_code } = req.user;
	if (role_code !== "R1" && role_code !== "R2" && role_code !== "R3") {
		return notAuthorized("Require admin or moderator or user role", res);
	}
	next();
};
