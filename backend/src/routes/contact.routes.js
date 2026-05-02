import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.post("/contact", verifyToken, sendContactMessage);

export default router;