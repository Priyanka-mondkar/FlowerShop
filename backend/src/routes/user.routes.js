import express from "express";
import upload from "../middleware/multer.js"

import {
  registerUser,
  loginUser,
  myinfo,
  myprofile,
  updateProfile
} from "../controllers/user.controllers.js";

import auth from "../middleware/auth.js";

const router = express.Router();

/* -------- AUTH -------- */

router.post("/register", registerUser);
router.post("/login", loginUser);

/* -------- USER INFO -------- */

router.get("/me", auth, myinfo);

/* -------- USER PROFILE -------- */

router.get("/profile", auth, myprofile);
router.put("/profile", auth, upload.single('avatar'),updateProfile);

export default router;