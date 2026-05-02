import db from "../config/DbConnect.js";

// GET all transactions (orders)
export const getTransactions = (req, res) => {
    const sql = `
        SELECT 
            o.order_id AS id,
            o.full_name AS customer,

            -- ✅ NEW: product name (multiple flowers combine)
            GROUP_CONCAT(f.name SEPARATOR ', ') AS product,

            o.total_amount AS amount,
            o.payment_method AS paymentMethod,
            o.order_date AS date,
            o.order_status AS status,
            o.address

        FROM orders o

        -- ✅ JOIN with order_items
        LEFT JOIN order_items oi ON o.order_id = oi.order_id

        -- ✅ JOIN with flowers
        LEFT JOIN flowers f ON oi.flower_id = f.id

        GROUP BY o.order_id

        ORDER BY o.order_date DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// UPDATE order status
export const updateTransactionStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const sql = "UPDATE orders SET order_status=? WHERE order_id=?";

    db.query(sql, [status, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Order status updated ✅" });
    });
};