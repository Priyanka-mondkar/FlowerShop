import express from "express";
import { placeOrder } from "../controllers/order.controllers.js";
import auth from "../middleware/auth.js";
import { getUserOrders } from "../controllers/order.controllers.js";
import { cancelOrder } from "../controllers/order.controllers.js";

const router = express.Router();

router.post("/place-order", auth,placeOrder);

router.get("/user/:userId", getUserOrders);

router.put("/cancel/:orderId", cancelOrder);

export default router;