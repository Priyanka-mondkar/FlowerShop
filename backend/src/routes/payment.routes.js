import express from "express"
import { makepayment } from "../controllers/payment.controllers.js"
import auth from "../middleware/auth.js"

const router=express()


router.post("/make-payment",auth,makepayment)
router.put("/update-payment/:orderId",auth,makepayment)

export default router