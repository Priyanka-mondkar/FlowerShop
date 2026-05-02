
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // ✅ FIRST load env

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // ✅ THEN use
export const makepayment = async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      payment_method_types: ["card"],
      metadata: { user_id }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

import db from "../config/DbConnect.js";

export const updatePaymentStatus = (req, res) => {

    const { orderId } = req.params;

    db.query(
        "UPDATE orders SET order_status = 'Paid' WHERE order_id = ?",
        [orderId],
        (err, result) => {

            if (err) {
                console.log("Update Error:", err);
                return res.status(500).json({ message: "Failed to update payment" });
            }

            res.json({
                message: "Payment status updated to Paid"
            });
        }
    );
};