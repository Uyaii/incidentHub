import { Router } from "express";
import { uuidv7 } from "uuidv7";
import supabase from "../utils/db.js";

const updatesRouter = Router();

updatesRouter.post("/incidents/:id/updates", async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  const { message, status } = req.body;
  try {
    if (!id || !userId)
      return res
        .status(404)
        .send({ status: "error", message: "ID Not Provided" });

    let incidentStatus = undefined;

    const { data: incidentData, error: incidentError } = await supabase
      .from("incidents")
      .select()
      .eq("id", id)
      .single();

    if (status !== undefined) {
      const { data, error } = await supabase
        .from("incidents")
        .update({ status: status })
        .eq("id", id)
        .select();

      if (error)
        return res.status(400).send({ status: "error", message: error });
    }
    const update = {
      id: uuidv7(),
      incident_id: id,
      message,
      status: incidentData.status,
      created_by_id: userId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("incident_updates")
      .insert(update)
      .select();
    if (error) return res.status(400).send({ status: "error", message: error });

    return res.status(200).send({
      status: "success",
      message: `Update Posted`,
      incidentData,
      data,
    });
  } catch (error) {
    return res.status(400).send({ status: "error", message: error });
  }
});

updatesRouter.get("/incidents/:id/updates", async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  try {
    if (!id || !userId)
      return res
        .status(404)
        .send({ status: "error", message: "ID Not Provided" });

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
