import { jwtVerify } from "jose";
import dotenv from "dotenv";

import User from "../models/User.js";
import { JWT_SECRET } from "../utils/getJwtSecret.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    //checking for the token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      //means there is no header and hence, no token
      res.status(401); //unauthorized
      throw new Error("Not authorized, no token");
    }

    //get the token
    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    //get the user with the userId in the token
    const user = await User.findById(payload.userId).select("_id name email");

    if (!user) {
      res.status(401); //unauthorized
      throw new Error("User not found");
    }

    //if the user exists, add it to the request to http calls can access it
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401);
    next(new Error("Not authorized. token failed"));
  }
};
