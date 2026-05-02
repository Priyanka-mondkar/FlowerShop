import db from "../config/DbConnect.js";


// ADD TO WISHLIST
export const addWishlist = (req, res) => {

    const { user_id, flower_id } = req.body;

    const query = `
        INSERT INTO wishlist (user_id, flower_id)
        VALUES (?, ?)
    `;

    db.query(query, [user_id, flower_id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Added to wishlist" });

    });

};


// GET WISHLIST
export const getWishlist = (req, res) => {

    const userId = req.params.userId;

    const query = `
        SELECT wishlist.id, flowers.name, flowers.price, flowers.image
        FROM wishlist
        JOIN flowers ON wishlist.flower_id = flowers.id
        WHERE wishlist.user_id = ?
    `;

    db.query(query, [userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(result);

    });

};


// REMOVE WISHLIST
export const removeWishlist = (req, res) => {

    const id = req.params.id;

    const query = "DELETE FROM wishlist WHERE id = ?";

    db.query(query, [id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Removed from wishlist" });

    });

};