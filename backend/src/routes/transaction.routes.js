import express from "express";
import {
    getTransactions,
    updateTransactionStatus
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/", getTransactions);
router.put("/:id", updateTransactionStatus);

export default router;