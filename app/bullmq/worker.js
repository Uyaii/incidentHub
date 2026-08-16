import { Job, Worker } from "bullmq";
import { connection } from "./bullmq.js";
import dotenv from "dotenv";
import supabase from "../utils/db.js";

dotenv.config();

const worker = new Worker(
  "notifications",
  async (job) => {
    console.log(job.data);
    const { incidentId, updatedByID } = job.data;

    // Get incident Information
    const { data: incidentData, error: incidentError } = await supabase
      .from("incidents")
      .select("title")
      .eq("id", incidentId)
      .single();

    if (incidentError) throw new Error(incidentError.message);

    // Get Updater Info
    const { data: updaterData, error: updaterError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", updatedByID)
      .single();

    if (updaterError) throw new Error(updaterError.message);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("incident_id", incidentId); // The result of this is an array of objects ie data= [{user_id: id},{},....], so we have to break it down to just an array of ids, no objects

    console.log("data:", data);
    if (error) throw new Error(error.message);

    const userIds = data.map((row) => row.user_id); // this now returns a new array of just the ids (each row that is each object is mapped to return the user_id key value pair from the objects)

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds); // then here the userIds array is passed to get all the user info of all the users subscribed for notifications, from this now we can get their full names and such to personalize their notifications

    usersData.map((user) =>
      console.log({
        message: `Dear ${user.full_name}, Incident "${incidentData.title}" has been updated by ${updaterData.full_name} `,
      }),
    );

    if (usersError) throw new Error(usersError.message);
  },
  { connection },
);

worker.on("failed", (job, error, prev) => {
  r
});
