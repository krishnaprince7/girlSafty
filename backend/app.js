import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/usersRoutes.js";

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Server is running running ");
});

app.use("/api", authRoutes);

export default app;   