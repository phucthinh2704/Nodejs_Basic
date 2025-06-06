import db from "../models";

export const getOne = (userId) =>
	new Promise(async (resolve, reject) => {
		try {
			const response = await db.User.findOne({
				where: { id: userId },
				attributes: {
					exclude: ["password", "role_code", "refresh_token"],
				},
				include: [
					{
						model: db.Role,
						as: "roleData",
						attributes: ["code", "value"], // chỉ chọn code và value
					},
				],
			});

			resolve({
				err: response ? 0 : 1,
				mes: response ? "Get user successfully" : "User not found",
				userData: response,
			});
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});
