import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import supabase from "../utils/db.js";

import { uuidv7 } from "uuidv7";

const subscriptionsRouter = Router();

subscriptionsRouter.post(
  "/incidents/:id/subscribe",

  async (req, res) => {
    const { id } = req.params;
    const { id: userId, full_name } = req.user;
    try {
      if (!id || !userId)
        return res.status(404).send({ status: "error", message: "ID Not Provided" });

      const subscribeData = {
        id: uuidv7(),
        user_id: userId,
        incident_id: id,
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("subscriptions")
        .insert(subscribeData)
        .select();
      if (error) return res.status(400).send({ status: "error", message: error });

      return res.status(200).send({
        status: "success",
        message: `User ${full_name} successfully subscribed to Incident`,
        data,
      });
    } catch (error) {
      return res.status(400).send({ status: "error", message: error });
    }
  },
);

subscriptionsRouter.delete("/incidents/:id/unsubscribe", async (req, res) => {
  const { id } = req.params; //* Use incident id
  const { id: userId, full_name } = req.user;

  try {
    if (!id) return res.status(404).send({ status: "error", message: "ID Not Provided" });

    const { data, error } = await supabase
      .from("subscriptions")
      .delete()
      .match({ user_id: userId, incident_id: id })
      .select();

    if (error)
      return res.status(400).send({ status: "error", message: "Incident not Found" });

    return res.status(200).send({
      status: "success",
      message: `User ${full_name} successfully unsubscribed to Incident`,
      data,
    });
  } catch (error) {
    return res.status(400).send({ status: "error", message: error });
  }
});

subscriptionsRouter.get("/me/subscriptions", async (req, res) => {
  const { id: userId } = req.user;
  try {
    if (!userId)
      return res.status(404).send({ status: "error", message: "ID Not Provided" });

    const { data, error } = await supabase
      .from("subscriptions")
      .select()
      .eq("user_id", userId);

    if (error) return res.status(400).send({ status: "error", message: error });
    return res.status(200).send({ status: "success", count: data.length, data });
  } catch (error) {
    return res.status(400).send({ status: "error", message: error });
  }
});
export default subscriptionsRouter;
