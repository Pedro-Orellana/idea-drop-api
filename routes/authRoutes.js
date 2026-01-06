import express from "express";
import User from "../models/User.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";
import { generateToken } from "../utils/generateToken.js";

const authRouter = express.Router();

//function to register a new user
//@route        /api/auth/register

authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400); //bad request status
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      //user already exists. cannot register it again
      res.status(400); //bad request
      throw new Error("A user already exists with this email");
    }

    //if user doesn't exist, create it and register it
    const newUser = await User.create({ name, email, password });

    //create tokens
    const payload = { userId: newUser._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    //set the refreshToken in an HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    res.status(201).json({
      //pass in the access token in the response
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//function to login user
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400); //bad request
      throw new Error("Email and password are required");
    }

    //find if the user is registered
    const user = await User.findOne({ email });
    if (!user) {
      //user is not registered
      res.status(401); //unauthorized status
      throw new Error("Invalid credentials");
    }

    //check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401); //unauthorized status
      throw new Error("Invalid credentials");
    }

    //at this point the email and password matches, so we can login
    //create tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    //set the refreshToken in an HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    res.status(201);
    res.json({
      //pass in the access token in the response
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//function to logout a user. Logs out and clears refresh token
authRouter.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
});

//refresh function. Generates a new access token from the refresh token
//@route        POST api/auth/refresh
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401); //unauthroized status
      throw new Error("No refresh token");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    //get the user from using the userId from the payload
    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(401); //unauthorized status
      throw new Error("No user exists");
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m"
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default authRouter;
