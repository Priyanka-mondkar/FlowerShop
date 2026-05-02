import express from "express";
import { addWishlist, getWishlist, removeWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/wishlist", addWishlist);

router.get("/wishlist/:userId", getWishlist);

router.delete("/wishlist/:id", removeWishlist);

export default router;