import db from "../config/DbConnect.js";

export const getDashboardData = async (req, res) => {
  try {

    // Total Revenue
    const [revenue] = await db.promise().query(
      "SELECT SUM(total_amount) AS totalRevenue FROM orders"
    );

    // Total Orders
    const [orders] = await db.promise().query(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );

    // Total Customers
    const [customers] = await db.promise().query(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'user'"
    );

    // Total Products
    const [products] = await db.promise().query(
      "SELECT COUNT(*) AS totalProducts FROM flowers"
    );

    // Recent Orders
    const [recentOrders] = await db.promise().query(`
      SELECT 
        order_id AS id,
        full_name AS customer,
        total_amount AS amount,
        order_status AS status,
        order_date AS date
      FROM orders
      ORDER BY order_date DESC
      LIMIT 5
    `);

    // Top Products
    const [topProducts] = await db.promise().query(`
      SELECT 
        name,
        0 AS sales,
        price AS revenue
      FROM flowers
      ORDER BY price DESC
      LIMIT 5
    `);

    // 🔥 REAL Monthly Sales (DB मधून)
    const [monthlySalesData] = await db.promise().query(`
      SELECT 
        MONTH(order_date) AS month,
        SUM(total_amount) AS total
      FROM orders
      GROUP BY MONTH(order_date)
      ORDER BY month ASC
    `);

    // 👉 12 months array तयार कर
    let monthlySales = new Array(12).fill(0);

    monthlySalesData.forEach(item => {
      monthlySales[item.month - 1] = item.total;
    });

    // FINAL RESPONSE
    res.json({
      totalRevenue: revenue[0].totalRevenue || 0,
      totalOrders: orders[0].totalOrders,
      totalCustomers: customers[0].totalCustomers,
      totalProducts: products[0].totalProducts,
      recentOrders,
      topProducts,
      monthlySales   // 🔥 IMPORTANT (charts साठी)
    });

  } catch (error) {
    console.log("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};