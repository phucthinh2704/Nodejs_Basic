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
			// queries là object chứa các tham số cấu hình phân trang và các điều kiện lọc khác
			// query là object chứa các tham số khác từ resquest (req.query)
			const queries = { raw: true, nest: true };
			const offset = !page || +page <= 1 ? 0 : +page - 1;
			const finalLimit = +limit || +process.env.LIMIT_BOOKS;
			queries.offset = offset * finalLimit;
			queries.limit = finalLimit;

			// Enhanced filtering
			const filterConditions = {};
			
			// Title search with case-insensitive
			if (name) {
				filterConditions.title = {
					[Op.like]: `%${name}%`
				};
			}

			// Availability range filter
			if (available) {
				if (typeof available === "string" && available.includes(",")) {
					available = available.split(",").map(Number);
				}
				filterConditions.available = { [Op.between]: available };
			}

			// Price range filter
			if (query.minPrice || query.maxPrice) {
				filterConditions.price = {};
				if (query.minPrice) filterConditions.price[Op.gte] = +query.minPrice;
				if (query.maxPrice) filterConditions.price[Op.lte] = +query.maxPrice;
			}

			// Category filter
			if (query.category) {
				filterConditions.category_code = query.category;
			}

			// Sorting
			if (sort) {
				const sortType = sort === "asc" || sort === "desc" ? sort : "asc";
				queries.order = [[order || "price", sortType]];
			}

			const response = await db.Book.findAndCountAll({
				where: filterConditions,
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

			// Calculate pagination metadata
			const totalPages = Math.ceil(response.count / finalLimit);
			const currentPage = offset + 1;

			resolve({
				err: response ? 0 : 1,
				mes: response ? "Get books successfully" : "Get books failed",
				data: {
					books: response.rows,
					pagination: {
						total: response.count,
						page: currentPage,
						limit: finalLimit,
						totalPages
					}
				}
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
