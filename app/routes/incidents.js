import { Router } from "express";
import supabase from "../utils/db.js";
import roleMiddleware from "../middleware/role.js";
import { uuidv7 } from "uuidv7";
import { slugify } from "../utils/helpers.js";
import { redisClient } from "../utils/redis.js";

const incidentsRouter = Router();

incidentsRouter.get("/", async (req, res) => {
  try {
    const incidents = JSON.parse(await redisClient.get("incidents"));
    console.log(incidents);

    // Caching Syntax 
    if (incidents === null) {
      const { data, error } = await supabase.from("incidents").select();
      if (error) return res.send({ status: "error", message: error });
      await redisClient.set("incidents", JSON.stringify(data), "EX", 60);
      res.status(200).send({ status: "success", count: data.length, message: data });
    } else {
      res
        .status(200)
        .send({ status: "success", count: incidents.length, message: incidents });
    }
  } catch (error) {
    return res.send(error);
  }
});

incidentsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(404).send({ status: "error", message: "ID Not Found" });
    const { data, error } = await supabase.from("incidents").select().eq("id", id);

    if (error) return res.status(404).send({ status: "error", message: error });

    return res.status(200).send({ status: "success", message: data });
  } catch (error) {
    return res.status(404).send({ status: "error", message: error });
  }
});

incidentsRouter.post("/", roleMiddleware(["admin", "maintainer"]), async (req, res) => {
  const { title, slug, description, status, severity, is_public } = req.body;
  const { id, role } = req.user;

  try {
    if (!title || !description)
      return res.status(400).send({ status: "error", message: "Incomplete Fields" });

    const formattedSlug = slugify(title);
    const extractedData = {
      id: uuidv7(),
      title,
      slug: formattedSlug,
      description,
      status,
      severity,
      is_public,
      created_by_id: id,
    };
    const { data, error } = await supabase
      .from("incidents")
      .insert(extractedData)
      .select();

    if (error) return res.status(400).send({ status: "error", message: error });
    return res.status(200).send({ status: "success", message: "Incident Created", data });
  } catch (error) {
    return res.status(400).send({ status: "error", message: error });
  }
});

incidentsRouter.patch(
  "/:id",
  roleMiddleware(["admin", "maintainer"]),
  async (req, res) => {
    const { id } = req.params;
    const { title, description, status, severity, is_public } = req.body;

    try {
      const { data: incidentData, error: incidentError } = await supabase
        .from("incidents")
        .select()
        .eq("id", id)
        .select();

      if (!id) return res.status(400).send({ status: "error", message: "ID Not Passed" });
      console.log(incidentData);

      // !  let formattedSlug = null;<== Using this is dangerous because if its null and title is undefined too then null will be inputed into the database but if its undefined the value will be dropped and wont affect the db
      let formattedSlug = undefined;
      if (title) {
        formattedSlug = slugify(title);
      }
      const extractedData = {
        title,
        slug: formattedSlug,
        description,
        status,
        severity,
        is_public,
      };
      const { data, error } = await supabase
        .from("incidents")
        .update(extractedData)
        .eq("id", id)
        .select();

      console.log(error);
      console.log(data.length);
      if (data.length <= 0)
        return res.status(400).send({ status: "error1", message: "No Incident Found" });

      if (error) return res.status(400).send({ status: "error2", message: error });

      return res
        .status(200)
        .send({ status: "success", message: "Incident Updated", data });
    } catch (error) {
      return res.status(400).send({ status: "error5", message: error });
    }
  },
);

incidentsRouter.delete(
  "/:id",
  roleMiddleware(["admin", "maintainer"]),
  async (req, res) => {
    const { id } = req.params;
    const { id: userId, full_name } = req.user;

    try {
      if (!id)
        return res.status(404).send({ status: "error", message: "ID Not Provided" });

      const { data, error } = await supabase
        .from("incidents")
        .delete()
        .eq("id", id)
        .select();
      if (data.length <= 0)
        return res
          .status(404)
          .send({ status: "error", message: "Incident not Found", error });

      return res.status(200).send({
        status: "success",
        message: `Successfully Deleted Incident`,
        data,
      });
    } catch (error) {
      return res.status(400).send({ status: "error", message: error });
    }
  },
);
export default incidentsRouter;
