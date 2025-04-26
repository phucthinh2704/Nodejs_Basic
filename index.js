// const express = require("express");
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import "./connection_db";
import initRoutes from "./src/routes";

dotenv.config();
const app = express();

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initRoutes(app);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
	console.log(`Server is running on port http://localhost:${PORT}`);
});
