import { Worker } from "bullmq";
import { connection } from "./bullmq.js";
import dotenv from "dotenv";
import supabase from "../utils/db.js";

dotenv.config();

const worker = new Worker(
  "notifications",
  async (job) => {
    console.log(job.data);
    const { incidentId } = job.data;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("user_id")
        .eq("incident_id", incidentId);
      if (error) return console.log(error)
  },
  { connection },
);
