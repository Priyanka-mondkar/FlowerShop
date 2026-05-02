import express from "express";
import { addReview, getReviews, deleteReview } from "../controllers/review.controller.js";

const router = express.Router();

/* ADD REVIEW */
router.post("/reviews", addReview);

/* GET REVIEWS */
router.get("/reviews", getReviews);

/* DELETE REVIEW */
router.delete("/reviews/:id", deleteReview);

export default router;