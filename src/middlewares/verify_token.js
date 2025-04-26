import jwt from "jsonwebtoken";
import { notAuthorized } from "./handle_error";

const verifyToken = (req, res, next) => {
	const token = req.headers.authorization;
	if (!token) {
		return notAuthorized("Require token", res);
	}
	const access_token = token.split(" ")[1];

	/**
    * 
      err là lỗi nếu có
      user là object chứa thông tin của user khi mã hóa bên hàm sign
      {
			id: response[0].id,
			email: response[0].email,
			role_code: response[0].role_code,
		}
    */
	jwt.verify(access_token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			return notAuthorized("Access token is not valid", res);
		}
		req.user = user;
		next();
	});
};

export default verifyToken;
