import { Router } from "express";
import { uuidv7 } from "uuidv7";
import supabase from "../utils/db.js";
import roleMiddleware from "../middleware/role.js";
import { Queue } from "bullmq";
import { notificationsQueue } from "../bullmq/bullmq.js";
import { getIO } from "../utils/socketIO.js";

const updatesRouter = Router();

updatesRouter.post(
  "/incidents/:id/updates",
  roleMiddleware(["admin", "maintainer"]),
  async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { message, status } = req.body;
    try {
      if (!id || !userId)
        return res.status(404).send({ status: "error", message: "ID Not Provided" });

      let currentStatus = status;

      const { data: incidentData, error: incidentError } = await supabase
        .from("incidents")
        .select()
        .eq("id", id)
        .single();
      if (incidentError)
        return res.status(400).send({ status: "error", message: incidentError });

      if (status !== undefined) {
        const { data, error } = await supabase
          .from("incidents")
          .update({ status: status })
          .eq("id", id)
          .select();

        if (error) return res.status(400).send({ status: "error", message: error });
      }
      const update = {
        id: uuidv7(),
        incident_id: id,
        message,
        status: status ? currentStatus : incidentData.status,
        created_by_id: userId,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("incident_updates")
        .insert(update)
        .select()
        .single();
      if (error) return res.status(400).send({ status: "error", message: error });

      // ! Notification queues
      await notificationsQueue.add("notifications", {
        incidentId: data.incident_id,
        updatedByID: userId,
      });

      const io = getIO();

      io.to(`incident:${id}`).emit("incident updated", data);

      return res.status(200).send({
        status: "success",
        message: `Update Posted`,
        incidentData,
        data,
      });
    } catch (error) {
      return res.status(400).send({ status: "error", message: error });
    }
  },
);

updatesRouter.get("/incidents/:id/updates", async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  try {
    if (!id || !userId)
      return res.status(404).send({ status: "error", message: "ID Not Provided" });

    const { data, error } = await supabase
      .from("incident_updates")
      .select()
      .eq("incident_id", id);

    if (error) return res.status(400).send({ status: "error", message: error });

    return res.status(200).send({
      status: "success",
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(400).send({ status: "error", message: error });
  }
});
export default updatesRouter;
