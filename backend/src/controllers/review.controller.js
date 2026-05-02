import db from "../config/DbConnect.js";

export const addReview = (req, res) => {

    const { user_id, name, avatar, message, rating } = req.body;

    const query = `
INSERT INTO reviews (user_id,name,avatar,message,rating)
VALUES (?,?,?,?,?)
`;

    db.query(query, [user_id, name, avatar, message, rating], (err, result) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Review added successfully" });

    });

};



export const getReviews = (req, res) => {

    const query = "SELECT * FROM reviews ORDER BY id DESC";

    db.query(query, (err, result) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json(result);

    });

};



export const deleteReview = (req, res) => {

    const id = req.params.id;

    const query = "DELETE FROM reviews WHERE id=?";

    db.query(query, [id], (err, result) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Review deleted" });

    });

};