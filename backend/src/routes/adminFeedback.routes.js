import express from "express";
import {
    getAdminFeedbacks,
    updateFeedbackStatus,
    deleteAdminFeedback
} from "../controllers/adminFeedback.controller.js";

const router = express.Router();

// 🔥 ADMIN ROUTES
router.get("/feedbacks", getAdminFeedbacks);
router.patch("/feedbacks/:id", updateFeedbackStatus);
router.delete("/feedbacks/:id", deleteAdminFeedback);

export default router;