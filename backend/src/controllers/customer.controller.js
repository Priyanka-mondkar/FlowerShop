import db from "../config/DbConnect.js";

// ================= GET ALL CUSTOMERS =================
export const getCustomers = (req, res) => {

    const sql = `
    SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.city,
        u.area,
        u.avatar,

        COUNT(o.order_id) AS orders,
        COALESCE(SUM(o.total_amount), 0) AS totalSpent

    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id

    WHERE u.role = 'user'

    GROUP BY u.id
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err });

        const customers = result.map(user => {
            const nameParts = user.name ? user.name.split(" ") : ["", ""];

            return {
                id: user.id,
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                email: user.email || "",
                phone: user.phone || "",
                city: user.city || "Unknown",
                address: user.area || "",
                avatar: user.avatar || "https://placehold.co/40x40?text=👤",
                status: "active",

                // 🔥 dynamic values
                orders: user.orders,
                totalSpent: user.totalSpent
            };
        });

        res.json(customers);
    });
};

// ================= ADD CUSTOMER =================
export const addCustomer = (req, res) => {
    const { firstName, lastName, email, phone, city, address, avatar } = req.body;

    const sql = `
        INSERT INTO users (name, email, phone, city, area, avatar, role)
        VALUES (?, ?, ?, ?, ?, ?, 'user')
    `;

    db.query(
        sql,
        [
            `${firstName || ""} ${lastName || ""}`.trim(),
            email,
            phone,
            city,
            address,
            avatar
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                message: "Customer added",
                id: result.insertId
            });
        }
    );
};

// ================= UPDATE CUSTOMER =================
export const updateCustomer = (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, city, address, avatar } = req.body;

    const sql = `
        UPDATE users 
        SET name=?, email=?, phone=?, city=?, area=?, avatar=? 
        WHERE id=?
    `;

    db.query(
        sql,
        [
            `${firstName || ""} ${lastName || ""}`.trim(),
            email,
            phone,
            city,
            address,
            avatar,
            id
        ],
        (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({ message: "Customer updated" });
        }
    );
};

// ================= DELETE CUSTOMER =================
export const deleteCustomer = (req, res) => {
    const { id } = req.params;

    // 🔥 STEP 1: delete order_items
    const deleteOrderItems = `
        DELETE oi FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.user_id = ?
    `;

    // 🔥 STEP 2: delete orders
    const deleteOrders = "DELETE FROM orders WHERE user_id=?";

    // 🔥 STEP 3: delete user
    const deleteUser = "DELETE FROM users WHERE id=?";

    db.query(deleteOrderItems, [id], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query(deleteOrders, [id], (err) => {
            if (err) return res.status(500).json({ error: err });

            db.query(deleteUser, [id], (err) => {
                if (err) return res.status(500).json({ error: err });

                res.json({ message: "Customer deleted successfully" });
            });
        });
    });
};