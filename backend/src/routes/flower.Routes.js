import express from "express";
import * as flowerController from "../controllers/flower.controller.js";
import db from "../config/DbConnect.js";

const router = express.Router();


/* -------------------- chatboat -------------------- */

router.get("/chatbot", (req, res) => {

  const { occasion_id, min, max } = req.query;

  let query = "SELECT * FROM flowers WHERE occasion_id = ?";
  let params = [occasion_id];

  if (min && max) {
    query += " AND price BETWEEN ? AND ?";
    params.push(min, max);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });

});

/* -------------------- GET ALL FLOWERS -------------------- */
router.get("/", flowerController.getFlowers);



/* -------------------- GET FLOWERS BY OCCASION -------------------- */
router.get("/occasion/:id", flowerController.getFlowersByOccasion);


/* -------------------- GET FLOWER BY ID -------------------- */
router.get("/:id", flowerController.getFlowerById);



export default router;