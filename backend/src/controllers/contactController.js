import db from "../config/DbConnect.js";
import sendMail from "../utils/sendMail.js";

export const sendContactMessage = (req, res) => {

    const userId = req.user.id;

    const { firstName, lastName, email, message } = req.body;

    const sql = `
        INSERT INTO contact_messages
        (user_id, first_name, last_name, email, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, firstName, lastName, email, message], async (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        try {
            await sendMail(firstName, email, message);
        } catch (mailErr) {
            console.log("Email error:", mailErr);
        }

        res.json({
            message: "Message sent successfully"
        });

    });

};