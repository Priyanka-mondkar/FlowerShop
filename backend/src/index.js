import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db, { DbConnect } from "./config/DbConnect.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ROUTES */
import userRoutes from "./routes/user.routes.js";
import flowerRoutes from "./routes/flower.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import paymentRoutes from "./routes/payment.routes.js"
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import customerRoutes from "./routes/customer.routes.js"; 
import transactionRoutes from "./routes/transaction.routes.js";
import adminFeedbackRoutes from "./routes/adminFeedback.routes.js";

const app = express();
const PORT = 5000;

/* -------------------- MIDDLEWARES -------------------- */

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  credentials: true
}));

// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
/* -------------------- DATABASE CONNECT -------------------- */

DbConnect();

/* -------------------- CREATE USERS TABLE -------------------- */

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    phone VARCHAR(15),
    flat VARCHAR(100),
    area VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),

    role ENUM('user','admin') DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT NULL,
    gender ENUM('male','female','other') DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

db.query(createUsersTable, (err) => {
  if (err) {
    console.error("❌ Users table creation failed:", err);
  } else {
    console.log("✅ Users table ready");
  }
});


/* -------------------- CREATE OCCASIONS TABLE -------------------- */

const createOccasionsTable = `
CREATE TABLE IF NOT EXISTS occasions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    occasion_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;
`;

db.query(createOccasionsTable, (err) => {
  if (err) {
    console.error("❌ Occasions table creation failed:", err);
  } else {
    console.log("🎉 Occasions table ready");
  }
});


/* -------------------- CREATE FLOWERS TABLE -------------------- */

const createFlowersTable = `
CREATE TABLE IF NOT EXISTS flowers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    price DECIMAL(10,2),
    description TEXT,

    occasion_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (occasion_id) REFERENCES occasions(id) 
    ON DELETE SET NULL
) ENGINE=InnoDB;
`;

db.query(createFlowersTable, (err) => {
  if (err) {
    console.error("❌ Flowers table creation failed:", err);
  } else {
    console.log("🌸 Flowers table ready");
  }
});


/* -------------------- CREATE CART TABLE -------------------- */

const createCartTable = `
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    flower_id INT,
    quantity INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flower_id) REFERENCES flowers(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

db.query(createCartTable, (err) => {
  if (err) {
    console.error("❌ Cart table creation failed:", err);
  } else {
    console.log("🛒 Cart table ready");
  }
});


/* -------------------- CREATE WISHLIST TABLE -------------------- */

const createWishlistTable = `
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    flower_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flower_id) REFERENCES flowers(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

db.query(createWishlistTable, (err) => {
  if (err) {
    console.error("❌ Wishlist table creation failed:", err);
  } else {
    console.log("❤️ Wishlist table ready");
  }
});

/* -------------------- CREATE CONTACT MESSAGES TABLE -------------------- */

const createContactTable = `
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150),
    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

db.query(createContactTable, (err) => {
  if (err) {
    console.error("❌ Contact table creation failed:", err);
  } else {
    console.log("📩 Contact messages table ready");
  }
});
/* -------------------- order table TABLE -------------------- */
db.query(`CREATE TABLE IF NOT EXISTS orders (
order_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
full_name VARCHAR(100),
phone VARCHAR(15),
address TEXT,
city VARCHAR(50),
state VARCHAR(50),
zip_code VARCHAR(10),
payment_method VARCHAR(20),
total_amount DECIMAL(10,2),
order_status VARCHAR(20) DEFAULT 'Pending',
order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, ()=>{

console.log("📦 Orders table ready");

});

/* -------------------- order item TABLE -------------------- */
db.query(`CREATE TABLE IF NOT EXISTS order_items (
item_id INT AUTO_INCREMENT PRIMARY KEY,
order_id INT,
flower_id INT,
quantity INT,
price DECIMAL(10,2)
)`, ()=>{

console.log("🧾 Order items table ready");

});

/* -------------------- CREATE REVIEWS TABLE -------------------- */

const createReviewsTable = `
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    user_id INT,
    name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    rating INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

db.query(createReviewsTable, (err) => {
  if (err) {
    console.error("❌ Reviews table creation failed:", err);
  } else {
    console.log("⭐ Reviews table ready");
  }
});


/* -------------------- BASIC ROUTE -------------------- */

app.get("/", (req, res) => {
  res.send("Flower Shop Backend Running 🚀");
});


/* -------------------- AUTH ROUTES -------------------- */

app.use("/api/auth", userRoutes);


/* -------------------- FLOWER ROUTES -------------------- */

app.use("/api/flowers", flowerRoutes);


/* -------------------- CART & WISHLIST ROUTES -------------------- */

app.use("/api", cartRoutes);
app.use("/api", wishlistRoutes);

/* -------------------- contact ROUTES -------------------- */

app.use("/api", contactRoutes);

/* -------------------- contact ROUTES -------------------- */
app.use("/api/orders", orderRoutes);

/* --------------------REVIEW ROUTES -------------------- */
app.use("/api", reviewRoutes);
app.use("/api/payment", paymentRoutes);

/* --------------------admin ROUTES -------------------- */

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes); 
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminFeedbackRoutes);

app.use('/uploads', express.static('uploads'));
/* -------------------- ERROR HANDLER -------------------- */

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
});