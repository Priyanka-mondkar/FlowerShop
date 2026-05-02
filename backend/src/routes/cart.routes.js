import express from "express";
import { addToCart, getCart, removeFromCart, updateCartQty } from "../controllers/cartController.js";

const router = express.Router();

router.post("/cart", addToCart);

router.get("/cart/:userId", getCart);

router.delete("/cart/:id", removeFromCart);

router.put("/cart/update/:id", updateCartQty);

export default router;