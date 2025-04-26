import express from "express";
import * as controllers from "../controllers";

const router = express.Router();

router.get("/category", controllers.insertDataCategory);
router.get("/book", controllers.insertDataBook);
module.exports = router;
