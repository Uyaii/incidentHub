import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.js";
import supabase from "./utils/db.js";
import incidentsRouter from "./routes/incidents.js";
import authMiddleware from "./middleware/auth.js";
import subscriptionsRouter from "./routes/subscriptions.js";
import updatesRouter from "./routes/updates.js";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { initializeSocket } from "./utils/socketIO.js";
import { authLimiter, globalLimiter } from "./utils/rateLimiter.js";

const app = express();

app.use(express.json());
app.use(cors());
dotenv.config();
const port = process.env.PORT;

// Socket.IO Syntax
const server = createServer(app);
initializeSocket(server);

const startServer = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.log("DB connection failed:", error.message);
    } else {
      console.log("DB connected successfully");
    }
    server.listen(port, () => {
      // when using socket.io replace app.listen with server.listen
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
app.use("/api", globalLimiter);

app.use("/auth", authLimiter, authRouter);
app.use("/api/incidents", authMiddleware, incidentsRouter);
app.use("/api", authMiddleware, subscriptionsRouter);
app.use("/api", authMiddleware, updatesRouter);
