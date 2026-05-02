
// import db from "../config/DbConnect.js";
// import sendMail from "../utils/sendMail.js";

// export const placeOrder = (req, res) => {

//   const {
//     user_id, // 🔥 FIX: query ऐवजी body मधून
//     full_name,
//     phone,
//     address,
//     city,
//     state,
//     email,
//     zip_code,
//     payment_method,
//     total_amount,
//     products
//   } = req.body;
//   console.log("📧 Email from frontend:", email);

//   // 🔥 SET STATUS BASED ON PAYMENT
//   let order_status = "Placed";

//   if (payment_method === "UPI") {
//     order_status = "Paid";
//   }

//   if (payment_method === "Card") {
//     order_status = "Paid";
//   }

//   const orderQuery = `
//   INSERT INTO orders 
//   (user_id, full_name, phone, address, city, state, zip_code, payment_method, total_amount, order_status)
//   VALUES (?,?,?,?,?,?,?,?,?,?)
//   `;

//   db.query(orderQuery,
//     [
//       user_id,
//       full_name,
//       phone,
//       address,
//       city,
//       state,
//       zip_code,
//       payment_method,
//       total_amount,
//       order_status
//     ],
//     async (err, result) => {

//       if (err) {
//         console.log("Order Insert Error:", err);
//         return res.status(500).json({ message: "Order failed" });
//       }

//       const orderId = result.insertId;
//       console.log("🧾 Order ID:", orderId);

//       // 📧 EMAIL SEND AFTER ORDER
//       try {

//         const message = `
// Your order has been placed successfully 🎉,

// Order ID: ${orderId},
// Total Amount: ₹${total_amount},
// Payment Method: ${payment_method},
// Status: ${order_status},

// Thank you for shopping with Moon Flowers 🌸
// `;

//         await sendMail(full_name, email, message);

//       } catch (err) {
//         console.log("Email Error:", err);
//       }

//       // 🔥 INSERT ORDER ITEMS
//       if (products && products.length > 0) {

//         products.forEach((item) => {

//           db.query(`
//           INSERT INTO order_items (order_id, flower_id, quantity, price)
//           VALUES (?,?,?,?)
//         `, [
//             orderId,
//             item.flower_id,
//             item.quantity,
//             item.price
//           ], (err) => {
//             if (err) console.log("Item Insert Error:", err);
//           });

//         });
//       }
//       // ✅🔥 IMPORTANT: CLEAR CART AFTER ORDER
//       const clearCartQuery = "DELETE FROM cart WHERE user_id = ?";
//       db.query(clearCartQuery, [user_id], (err) => {
//         if (err) console.log("Cart clear error:", err);
//       });

//       // 🔥 SMS (optional safe)
//       if (typeof sendSMS === "function") {
//         sendSMS(phone, `Moon Flowers 🌸

// Hello ${full_name},

// Your order is ${order_status}!

// Order ID: ${orderId}

// Total Amount: ₹${total_amount}

// Thank you for shopping with us!`);
//       }

//       res.status(201).json({
//         message: "Order placed successfully",
//         orderId,
//         status: order_status
//       });

//     });
// };

// export const getUserOrders = async (req, res) => {

//   const userId = req.params.userId;

//   try {

//     const [orders] = await db.promise().query(`
//       SELECT 
//         o.order_id,
//         o.total_amount,
//         o.order_status,
//         o.order_date,
//         oi.quantity,
//         oi.price,
//         f.name AS product_name,
//         f.image
//       FROM orders o
//       JOIN order_items oi ON o.order_id = oi.order_id
//       JOIN flowers f ON oi.flower_id = f.id
//       WHERE o.user_id = ?
//       ORDER BY o.order_id DESC
//     `, [userId]);

//     res.json(orders);

//   } catch (err) {
//     console.log("Fetch Error:", err);
//     res.status(500).json({ message: "Error fetching orders" });
//   }
// };

// export const cancelOrder = (req, res) => {

//   const orderId = req.params.orderId;

//   const query = `
//     UPDATE orders 
//     SET order_status = 'Cancelled'
//     WHERE order_id = ?
//   `;

//   db.query(query, [orderId], (err, result) => {

//     if (err) {
//       console.log("Cancel Error:", err);
//       return res.status(500).json({ message: "Cancel failed" });
//     }

//     res.json({ message: "Order cancelled successfully" });

//   });
// };

import db from "../config/DbConnect.js";
import sendMail from "../utils/sendMail.js";

export const placeOrder = (req, res) => {

  const {
    user_id,
    full_name,
    phone,
    address,
    city,
    state,
    email,
    zip_code,
    payment_method,
    total_amount,
    products
  } = req.body;

  console.log("📧 Email from frontend:", email);

  // 🔥 SET STATUS BASED ON PAYMENT
  let order_status = "Placed";

  if (payment_method === "UPI") {
    order_status = "Paid";
  }

  if (payment_method === "Card") {
    order_status = "Paid";
  }

  const orderQuery = `
  INSERT INTO orders 
  (user_id, full_name, phone, address, city, state, zip_code, payment_method, total_amount, order_status)
  VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(orderQuery,
    [
      user_id,
      full_name,
      phone,
      address,
      city,
      state,
      zip_code,
      payment_method,
      total_amount,
      order_status
    ],
    async (err, result) => {

      if (err) {
        console.log("Order Insert Error:", err);
        return res.status(500).json({ message: "Order failed" });
      }

      const orderId = result.insertId;
      console.log("🧾 Order ID:", orderId);

      // 🔥 CREATE PRODUCT LIST FOR EMAIL
      let productList = "";

      if (products && products.length > 0) {
        products.forEach(item => {
          productList += `• ${item.name} ×${item.quantity} = ₹${item.price * item.quantity}<br>`;
        });
      }

      // 📧 EMAIL SEND AFTER ORDER
      try {

        const message = `
<p>Your order is placed 🎉</p>

<p><b>Order ID:</b> ${orderId}</p>

<p><b>Products:</b></p>
<p>${productList}</p>

<p><b>Total Amount:</b> ₹${total_amount}</p>
<p><b>Payment:</b> ${payment_method}</p>
<p><b>Status:</b> ${order_status}</p>

<p>Thank you for shopping with Moon Flowers 🌸❤️</p>
`;

        await sendMail(full_name, email, message);

      } catch (err) {
        console.log("Email Error:", err);
      }

      // 🔥 INSERT ORDER ITEMS
      if (products && products.length > 0) {

        products.forEach((item) => {

          db.query(`
          INSERT INTO order_items (order_id, flower_id, quantity, price)
          VALUES (?,?,?,?)
        `, [
            orderId,
            item.flower_id,
            item.quantity,
            item.price
          ], (err) => {
            if (err) console.log("Item Insert Error:", err);
          });

        });
      }

      // ✅ CLEAR CART
      const clearCartQuery = "DELETE FROM cart WHERE user_id = ?";
      db.query(clearCartQuery, [user_id], (err) => {
        if (err) console.log("Cart clear error:", err);
      });

      // 🔥 SMS (optional)
      if (typeof sendSMS === "function") {
        sendSMS(phone, `Moon Flowers 🌸

Hello ${full_name},

Your order is ${order_status}!

Order ID: ${orderId}

Total Amount: ₹${total_amount}

Thank you for shopping with us!`);
      }

      res.status(201).json({
        message: "Order placed successfully",
        orderId,
        status: order_status
      });

    });
};

export const getUserOrders = async (req, res) => {

  const userId = req.params.userId;

  try {

    const [orders] = await db.promise().query(`
      SELECT 
        o.order_id,
        o.total_amount,
        o.order_status,
        o.order_date,
        oi.quantity,
        oi.price,
        f.name AS product_name,
        f.image
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN flowers f ON oi.flower_id = f.id
      WHERE o.user_id = ?
      ORDER BY o.order_id DESC
    `, [userId]);

    res.json(orders);

  } catch (err) {
    console.log("Fetch Error:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const cancelOrder = (req, res) => {

  const orderId = req.params.orderId;

  const query = `
    UPDATE orders 
    SET order_status = 'Cancelled'
    WHERE order_id = ?
  `;

  db.query(query, [orderId], (err, result) => {

    if (err) {
      console.log("Cancel Error:", err);
      return res.status(500).json({ message: "Cancel failed" });
    }

    res.json({ message: "Order cancelled successfully" });

  });
};