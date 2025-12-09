import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import ideaRouter from "./routes/ideaRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

//neccesary middleware
app.use(cors());
app.use(express.json());

//routers
app.use("/api/ideas", ideaRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
