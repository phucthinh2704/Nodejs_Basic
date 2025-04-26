import express from "express";
import * as controllers from "../controllers";
import verifyToken from "../middlewares/verify_token";
import { isCreator } from "../middlewares/verify_role";
import uploadCloud from "../middlewares/cloudinary.upload";

const router = express.Router();

// PUBLIC ROUTE
router.get("/", controllers.getBooks);

// PRIVATE ROUTE
router.use(verifyToken);
router.use(isCreator);
router.post("/", uploadCloud.single("image"), controllers.createNewBook);
router.put("/", uploadCloud.single("image"), controllers.updateBook);
router.delete("/", controllers.deleteBook);

module.exports = router;
