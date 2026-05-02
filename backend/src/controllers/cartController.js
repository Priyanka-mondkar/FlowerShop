import db from "../config/DbConnect.js";


// ADD TO CART
export const addToCart = (req, res) => {

    const { user_id, flower_id, quantity } = req.body;

    const query = `
        INSERT INTO cart (user_id, flower_id, quantity)
        VALUES (?, ?, ?)
    `;

    db.query(query, [user_id, flower_id, quantity], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Product added to cart" });

    });
};


// GET USER CART
export const getCart = (req, res) => {

    const userId = req.params.userId;

    const query = `
    SELECT 
        cart.id, 
        cart.flower_id,   -- 🔥 ADD THIS
        flowers.name, 
        flowers.price, 
        flowers.image, 
        cart.quantity
    FROM cart
    JOIN flowers ON cart.flower_id = flowers.id
    WHERE cart.user_id = ?
`;

    db.query(query, [userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(result);

    });

};


// REMOVE ITEM
export const removeFromCart = (req, res) => {

    const cartId = req.params.id;

    const query = "DELETE FROM cart WHERE id = ?";

    db.query(query, [cartId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "Item removed from cart" });

    });

};

// UPDATE QUANTITY
export const updateCartQty = (req, res) => {

    const cartId = req.params.id;
    const { change } = req.body;

    const getQuery = "SELECT quantity FROM cart WHERE id = ?";

    db.query(getQuery, [cartId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        let newQty = result[0].quantity + change;

        if (newQty <= 0) {

            const deleteQuery = "DELETE FROM cart WHERE id = ?";

            db.query(deleteQuery, [cartId], (err) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Database error" });
                }

                return res.json({ message: "Item removed from cart" });

            });

        } else {

            const updateQuery = "UPDATE cart SET quantity = ? WHERE id = ?";

            db.query(updateQuery, [newQty, cartId], (err) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Database error" });
                }

                res.json({ message: "Quantity updated" });

            });

        }

    });

};