import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJwtSecret.js";

//function to generate a new token
//@payload          data to embed in the token
//@expiresIn        Expiration time for the token ('15m', '7d', '30d')
export const generateToken = async (payload, expiresIn = "15m") => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
};
