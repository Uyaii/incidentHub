import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import authRouter from "./routes/auth.js";
import supabase from "./utils/db.js";
import incidentsRouter from "./routes/incidents.js";
import authMiddleware from "../middleware/auth.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const port = process.env.PORT;

const startServer = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.log("DB connection failed:", error.message);
    } else {
      console.log("DB connected successfully");
    }
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

app.use("/api/health", healthRoute);
app.use("/auth", authRouter);
app.use("/api/incidents", authMiddleware, incidentsRouter);
