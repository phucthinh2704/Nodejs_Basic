import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models";
import { notAuthorized } from "../middlewares/handle_error";

const hashPassword = (password) => {
	const salt = bcrypt.genSaltSync(8);
	const hash = bcrypt.hashSync(password, salt); // thêm muối vào password để giải mã được password thì cũng an toàn
	return hash;
};

// const [user, created] = await User.findOrCreate({
//   where: { username: 'sdepold' },
//   defaults: {
//     job: 'Technical Lead JavaScript',
//   },
// }); ==> Biến created sẽ là true nếu tạo mới và false nếu tồn tại
export const register = ({ email, password }) =>
	new Promise(async (resolve, reject) => {
		try {
			const response = await db.User.findOrCreate({
				where: { email },
				defaults: { email, password: hashPassword(password) },
			});

			const accessToken = response[1]
				? jwt.sign(
						{
							id: response[0].id,
							email: response[0].email,
							role_code: response[0].role_code,
						},
						process.env.JWT_SECRET,
						{ expiresIn: "10s" }
				  )
				: null;

			const refreshToken = response[1]
				? jwt.sign(
						{
							id: response[0].id,
						},
						process.env.JWT_SECRET_REFRESH,
						{ expiresIn: "15d" }
				  )
				: null;
			resolve({
				err: response[1] ? 0 : 1,
				mes: response[1]
					? "Register successfully"
					: "Email already exists",
				access_token: accessToken ? `Bearer ${accessToken}` : null,
				refresh_token: refreshToken,
			});
			if (refreshToken) {
				await db.User.update(
					{ refresh_token: refreshToken },
					{
						where: {
							id: response[0].id,
						},
					}
				);
			}
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});

export const login = ({ email, password }) =>
	new Promise(async (resolve, reject) => {
		try {
			const response = await db.User.findOne({
				where: { email },
				raw: true, // lấy ra object thuần chứ không phải instance của sequelize
			});
			const isChecked =
				response && bcrypt.compareSync(password, response.password);
			const accessToken = isChecked
				? jwt.sign(
						{
							id: response.id,
							email: response.email,
							role_code: response.role_code,
						},
						process.env.JWT_SECRET,
						{ expiresIn: "10s" }
				  )
				: null;
			const refreshToken = isChecked
				? jwt.sign(
						{
							id: response.id,
						},
						process.env.JWT_SECRET_REFRESH,
						{ expiresIn: "60s" }
				  )
				: null;
			resolve({
				err: accessToken ? 0 : 1,
				mes: accessToken
					? "Login successfully"
					: response
					? "Password is incorrect"
					: "Email not found",
				access_token: accessToken ? `Bearer ${accessToken}` : null,
				refresh_token: refreshToken,
			});
			if (refreshToken) {
				await db.User.update(
					{ refresh_token: refreshToken },
					{
						where: {
							id: response.id,
						},
					}
				);
			}
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});

export const refreshToken = ({ refresh_token }) =>
	new Promise(async (resolve, reject) => {
		try {
			const response = await db.User.findOne({
				where: { refresh_token },
			});
			if (response) {
				jwt.verify(
					refresh_token,
					process.env.JWT_SECRET_REFRESH,
					(err, user) => {
						if (err) {
							resolve({
								err: 1,
								mes: "Refresh token is expired. Please login again",
							});
						} else {
							const accessToken = jwt.sign(
								{
									id: response.id,
									email: response.email,
									role_code: response.role_code,
								},
								process.env.JWT_SECRET,
								{ expiresIn: "5d" }
							);
							resolve({
								err: accessToken ? 0 : 1,
								mes: accessToken ? "OK" : "Failed to generate new access token",
								access_token: accessToken ? `Bearer ${accessToken}` : null,
								refresh_token
							});
						}
					}
				);
			} else {
				resolve({ err: 1, mes: "Refresh token is not found" });
			}
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});
