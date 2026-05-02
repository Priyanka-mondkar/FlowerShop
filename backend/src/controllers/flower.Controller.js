import db from "../config/DbConnect.js";

// get all flowers
export const getFlowers = (req,res)=>{
    const query = "SELECT * FROM flowers";

    db.query(query,(err,result)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.json(result);
    });
};


// get single flower
export const getFlowerById = (req,res)=>{
    const id = req.params.id;

    const query = "SELECT * FROM flowers WHERE id=?";

    db.query(query,[id],(err,result)=>{
        if(err){
            return res.status(500).json(err);
        }
        res.json(result[0]);
    });
};

// get flowers by occasion

export const getFlowersByOccasion = (req, res) => {

    const occasionId = req.params.id;

    const query = "SELECT * FROM flowers WHERE occasion_id = ?";

    db.query(query, [occasionId], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

};

