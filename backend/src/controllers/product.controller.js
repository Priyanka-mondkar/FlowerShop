import db from "../config/DbConnect.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// GET all flowers
export const getProducts = (req, res) => {
    db.query("SELECT * FROM flowers", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// ADD flower
// export const addProduct = (req, res) => {
//     const { name, price, image, description, occasion_id, stock } = req.body;
//     db.query(
//         "INSERT INTO flowers (name, price, image, description, occasion_id, stock) VALUES (?, ?, ?, ?, ?, ?)",
//         [name, price, image, description, occasion_id, stock],
//         (err) => {
//             if (err) return res.status(500).json(err);
//             res.json({ message: "Flower added" });
//         }
//     );
// };
export const addProduct = async (req, res) => {
    try {
        const { name, price, description, occasion_id, stock } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const response = await uploadToCloudinary(req.file);

        if (!response) {
            return res.status(400).json({ message: "Cloudinary upload failed" });
        }

        const ProductImage = response.secure_url;

        db.query(
            "INSERT INTO flowers (name, price, image, description, occasion_id, stock) VALUES (?, ?, ?, ?, ?, ?)",
            [name, price, ProductImage, description, occasion_id, stock],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });

                return res.status(200).json({ message: "Product added successfully" });
            }
        );

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error adding product", error: error.message });
    }
};

// UPDATE flower
export const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, price, image, description, occasion_id, stock } = req.body;

    db.query(
        "UPDATE flowers SET name=?, price=?, image=?, description=?, stock=?, occasion_id=? WHERE id=?",
        [name, price, image, description, stock, occasion_id, id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Flower updated" });
        }
    );
};
// DELETE flower
export const deleteProduct = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM flowers WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Flower deleted" });
    });
};