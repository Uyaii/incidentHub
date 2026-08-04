import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const port = process.env.PORT;

const startServer = async () => {
  try {
    app.listen(port, () => `Listening on port: ${port}`);
  } catch (error) {
    console.log(error);
  }
};

startServer();

app.use("/api/health", healthRoute);
