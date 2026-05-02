import express from "express";
import { getDashboardData } from "../controllers/admin.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", auth, getDashboardData);

export default router;