import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/DbConnect.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/* ---------------- REGISTER USER ---------------- */

export const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if ([name, email, password].some((elm) => !elm)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserQuery, [email], (err, results) => {

      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // 🔥 ROLE ADD (default user)
      const insertUserQuery =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

      db.query(insertUserQuery, [name, email, hashedPassword, "user"], (err, result) => {

        if (err) {
          return res.status(500).json({ message: "Error in signup" });
        }

        const token = jwt.sign(
          { id: result.insertId, email: email, role: "user" }, // 👈 role add
          "secretkey123",
          { expiresIn: "1d" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
          message: "Signup successful ✅",
          token: token
        });

      });

    });

  } catch (error) {
    return res.status(500).json({ message: "Server error in signup" });
  }
};


/* ---------------- LOGIN USER ---------------- */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((elm) => !elm)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const findUserQuery = "SELECT * FROM users WHERE email = ?";

    db.query(findUserQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Please signup first" });
      }

      const user = results[0];

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      // 🔥 TOKEN madhe ROLE add kelay
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, // 👈 IMPORTANT
        "secretkey123",
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log("token:", token);

      return res.status(200).json({
        message: "Login successful ✅",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,        // 👈 FRONTEND la role milel
          avatar: user.avatar     // 👈 spelling fix
        },
        token
      });
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error in login" });
  }
};


/* ---------------- USER INFO ---------------- */

export const myinfo = async (req, res) => {
  try {

    return res.status(200).json({
      message: "User info fetched successfully",
      user: req.user
    });

  } catch (error) {
    console.log("error in get myinfo", error);

    return res.status(500).json({
      message: "error in fetching myinfo"
    });
  }
};


/* ---------------- USER PROFILE ---------------- */

export const myprofile = async (req, res) => {
  try {

    const user = req.user;
    console.log("user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.id;

    if (!userId) {
      return res.status(404).json({ message: "UserId not found" });
    }

    const findUserQuery = "SELECT * FROM users WHERE id = ?";

    db.query(findUserQuery, [userId], (err, results) => {

      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not exists" });
      }

      const userData = results[0];

      return res.status(200).json({
        message: "User profile fetched successfully",
        user: userData
      });

    });

  } catch (error) {
    console.log("Error in myprofile:", error);
    return res.status(500).json({
      message: "Server error while fetching profile"
    });
  }
};


/* ---------------- UPDATE PROFILE ---------------- */

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await db.promise().query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not exists" });
    }

    const user = results[0];

    const {
      name, phone, flat, area, city, state, pincode
    } = req.body;

    const file = req.file;

    let AvatarImage = user.avatar;

    if (file) {
      const response = await uploadToCloudinary(file);
      if (!response) {
        return res.status(400).json({ message: "Cloudinary upload failed" });
      }
      AvatarImage = response.secure_url;
    }

    const query = `
    UPDATE users 
    SET name=?, phone=?, flat=?, area=?, city=?, state=?, pincode=?, avatar=?
    WHERE id=?`;

    db.query(
      query,
      [name, phone, flat, area, city, state, pincode, AvatarImage, userId],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Database error" });
        }

        return res.json({
          message: "Profile updated successfully",
          user: {
            id: userId,
            name,
            phone,
            flat,
            area,
            city,
            state,
            pincode,
            avatar: AvatarImage
          }
        });
      }
    );

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};