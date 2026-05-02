// import jwt from "jsonwebtoken";

// export const auth = (req, res, next) => {
//   try {

//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).json({ message: "Access denied. No token provided" });
//     }

//     const decodedToken = jwt.verify(token, "secretkey123");
    
//     if(decodedToken) return res.status(404).json({message:"errorin decoding token"})
//     req.user = decodedToken;   // user info request मध्ये store

//     next();

//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
// export default auth

import jwt from "jsonwebtoken";


const auth = (req, res, next) => {

  try {

    let token;

    console.log("Cookies:", req.cookies);
    console.log("Headers:", req.headers.authorization);

    // cookie check
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // header check
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided"
      });
    }

    const decoded = jwt.verify(token, "secretkey123");

    console.log("Decoded user:", decoded);

    req.user = decoded;

    next();

  } catch (error) {

    console.log("JWT Error:", error);

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }

};

export default auth;
