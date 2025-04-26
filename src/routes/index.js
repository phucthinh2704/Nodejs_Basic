import userRouter from "./user.route";
import authRouter from "./auth.route";
import insertRouter from "./insert.route";
import bookRouter from "./book.route";
import { notFound } from "../middlewares/handle_error";

const initRoutes = (app) => {
	app.use("/api/v1/user", userRouter);
	app.use("/api/v1/auth", authRouter);
	app.use("/api/v1/insert", insertRouter);
	app.use("/api/v1/books", bookRouter);
	app.use(notFound);
};

module.exports = initRoutes;
