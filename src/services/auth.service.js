import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models";

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

			const token = response[1]
				? jwt.sign(
						{
							id: response[0].id,
							email: response[0].email,
							role_code: response[0].role_code,
						},
						process.env.JWT_SECRET,
						{ expiresIn: "10d" }
				  )
				: null;
			resolve({
				err: response[1] ? 0 : 1,
				mes: response[1]
					? "Register successfully"
					: "Email already exists",
				access_token: token ? `Bearer ${token}` : null,
			});
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
			const token = isChecked
				? jwt.sign(
						{
							id: response.id,
							email: response.email,
							role_code: response.role_code,
						},
						process.env.JWT_SECRET,
						{ expiresIn: "10d" }
				  )
				: null;
			resolve({
				err: token ? 0 : 1,
				mes: token
					? "Login successfully"
					: response
					? "Password is incorrect"
					: "Email not found",
				access_token: token ? `Bearer ${token}` : null,
			});
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});
