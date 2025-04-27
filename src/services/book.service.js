import { Op } from "sequelize";
import db from "../models";
const cloudinary = require("cloudinary").v2;

export const getBooks = ({
	page,
	limit,
	order,
	name,
	sort,
	available,
	...query
}) =>
	new Promise(async (resolve, reject) => {
		try {
			const queries = { raw: true, nest: true };
			// Nếu bỏ mỗi cái nest: true thì response của cả bên REST Client lẫn terminal đều là
			// 'categoryData.id': 1,
			// 'categoryData.code': 'RT6',
			// 'categoryData.value': 'Travel'

			// Còn cái raw: true mà bỏ đi thì dưới màn hình terminal sẽ dạng:
			//     Book {
			//       dataValues: [Object],
			//       _previousDataValues: [Object],
			//       uniqno: 1,
			//       _changed: Set {},
			//       _options: [Object],
			//       isNewRecord: false,
			//       categoryData: [Category]
			//     }
			const offset = !page || +page <= 1 ? 0 : +page - 1;
			const finalLimit = +limit || +process.env.LIMIT_BOOKS;
			queries.offset = offset * finalLimit; // vị trí muốn lấy, nếu là 0 thì lấy từ đầu
			queries.limit = finalLimit; // số lượng muốn lấy
			if (sort) {
				const sortType =
					sort === "asc" || sort === "desc" ? sort : "asc";
				queries.order = [["price", sortType]];
			}

			if (available) {
				// Nếu là chuỗi có dấu phẩy, chuyển thành mảng
				if (typeof available === "string" && available.includes(",")) {
					available = available.split(",").map(Number);
				}
				query.available = { [Op.between]: available };
			}
			if (name) {
				query.title = {
					[Op.substring]: name,
				};
			}

			const response = await db.Book.findAndCountAll({
				where: query,
				...queries,
				attributes: {
					exclude: ["category_code"],
				},
				include: [
					{
						model: db.Category,
						as: "categoryData",
						attributes: ["code", "value"],
					},
				],
			});
			resolve({
				err: response ? 0 : 1,
				mes: response ? "Get books successfully" : "Get books failed",
				data: response,
			});
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});

export const createNewBook = (body, fileData) =>
	new Promise(async (resolve, reject) => {
		try {
			const response = await db.Book.findOrCreate({
				// Tạo mới hoặc tìm kiếm => kết quả [data, created]
				where: {
					title: body.title,
				},
				defaults: {
					...body,
					image: fileData?.path,
					filename: fileData?.filename,
				},
			});
			resolve({
				err: response[1] ? 0 : 1,
				mes: response[1]
					? "Create new book successfully"
					: "Book is already exists",
			});
			if (!response[1] && fileData) {
				await cloudinary.uploader.destroy(fileData.filename);
			}
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
			if (fileData) {
				await cloudinary.uploader.destroy(fileData.filename);
			}
		}
	});

export const updateBook = ({ id, ...body }, fileData) =>
	new Promise(async (resolve, reject) => {
		try {
			if (fileData) {
				// Xóa ảnh cũ trên cloudinary
				const book = await db.Book.findByPk(id, {
					raw: true,
				});
				if (book) {
					await cloudinary.uploader.destroy(book.filename);
				}

				// Thêm ảnh mới vào body
				body.image = fileData?.path;
			}
			const response = await db.Book.update(
				{ ...body, filename: fileData?.filename },
				{
					where: { id },
				}
			);

			resolve({
				err: response[0] > 0 ? 0 : 1,
				mes:
					response[0] > 0
						? "Update book successfully"
						: "Book is not found",
			});
			if (response[0] === 0 && fileData) {
				await cloudinary.uploader.destroy(fileData.filename);
			}
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
			if (fileData) {
				await cloudinary.uploader.destroy(fileData.filename);
			}
		}
	});

export const deleteBook = (book_ids_array) =>
	new Promise(async (resolve, reject) => {
		try {
			const deletePromises = book_ids_array.map(async (id) => {
				const book = await db.Book.findByPk(id);
				const response = await db.Book.destroy({
					where: { id },
				});

				if (response > 0) {
					await cloudinary.uploader.destroy(book.filename);
					return 1; // Đánh dấu xóa thành công
				}
				return 0; // Đánh dấu xóa thất bại
			});
			// console.log(deletePromises);
			const results = await Promise.all(deletePromises); // sử dụng Promise.all vì deletePromises là mảng các promise
			// console.log(results);

			// Tính tổng số lượng sách đã xóa thành công
			const count = results.reduce((sum, result) => sum + result, 0);

			resolve({
				err: count > 0 ? 0 : 1,
				mes:
					count > 0
						? `Deleted ${count} book(s) successfully`
						: "Can't delete book",
			});
		} catch (error) {
			reject({
				err: -1,
				mes: error.message,
			});
		}
	});
