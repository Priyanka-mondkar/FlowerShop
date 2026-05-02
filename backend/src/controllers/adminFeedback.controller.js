import db from "../config/DbConnect.js";

// ================= GET ALL FEEDBACKS (ADMIN) =================
export const getAdminFeedbacks = (req, res) => {

    const query = `
    SELECT 
        r.id,
        r.user_id,
        r.name AS customerName,
        r.message,
        r.rating,
        r.created_at AS date,
        r.avatar,
        r.status,
        u.email
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
    `;

    db.query(query, (err, result) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json(result);

    });
};


// ================= UPDATE STATUS =================
export const updateFeedbackStatus = (req, res) => {

    const id = req.params.id;
    const { status } = req.body;

    const query = "UPDATE reviews SET status=? WHERE id=?";

    db.query(query, [status, id], (err) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Feedback status updated" });

    });
};


// ================= DELETE FEEDBACK =================
export const deleteAdminFeedback = (req, res) => {

    const id = req.params.id;

    const query = "DELETE FROM reviews WHERE id=?";

    db.query(query, [id], (err) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Feedback deleted" });

    });
};