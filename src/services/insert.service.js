import db from "../models";
import generateUniqueCode from "../helpers/generateCode";
import getRandomElement from "../helpers/randomElement";

export const insertDataCategory = (genres) =>
	new Promise(async (resolve, reject) => {
		try {
			genres.forEach(async (genre) => {
				const response = await db.Category.create({
					code: generateUniqueCode(genre),
					value: genre,
				});
			});
			resolve("Insert data category successfully");
		} catch (error) {
			reject({
				err: -1,
				mes: "Failed to insert data",
			});
		}
	});

export const insertDataBook = (books, genres) =>
	new Promise(async (resolve, reject) => {
		try {
			books.forEach(async (book) => {
				const response = await db.Book.create({
					title: book.bookTitle,
					price: book.bookPrice,
					available: book.available,
					image: book.imageURL,
					description: book.bookDescription,
					category_code: getRandomElement(genres),
				});
			});
			resolve("Insert data book successfully");
		} catch (error) {
			reject({
				err: -1,
				mes: "Failed to insert data",
			});
		}
	});
