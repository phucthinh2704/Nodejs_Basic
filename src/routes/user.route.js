import express from "express";
import * as controllers from "../controllers";
import verifyToken from "../middlewares/verify_token";
import { isAdmin, isModerator } from "../middlewares/verify_role";
const router = express.Router();

router.use(verifyToken);
// router.use(isAdmin);
router.get("/", controllers.getCurrentUser);

module.exports = router;

