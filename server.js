import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import ideaRouter from "./routes/ideaRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { ErrorHandler } from "./middleware/ErrorHandler.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

//connection to MongoDB
connectDB();

//neccesary middleware

//CORS config
const allowedOrigins = [
  "http://localhost:3000",
  "https://idea-drop-ui-azure.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routers
app.use("/api/ideas", ideaRouter);
app.use("/api/auth", authRouter);

//404 fallback
app.use((req, res, next) => {
  const error = new Error(`Not found -- ${req.originalUrl}`);
  res.status(404);
  next(error);
});

//custom middleware
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
