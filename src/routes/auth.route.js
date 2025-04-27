import express from "express";
import * as controllers from "../controllers";
const router = express.Router();

router.post("/register", controllers.registerController);
router.post("/login", controllers.loginController);
router.post("/refresh-token", controllers.refreshTokenController);

module.exports = router;

