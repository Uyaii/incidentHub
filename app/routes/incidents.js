import { Router } from "express";
import supabase from "../utils/db.js";
import roleMiddleware from "../middleware/role.js";
import { uuidv7 } from "uuidv7";
import { slugify } from "../utils/helpers.js";

const incidentsRouter = Router();

incidentsRouter.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("incidents").select();
    if (error) return res.send({ status: "error", message: error });

    res.status(200).send({ status: "success", message: data });
  } catch (error) {
    return res.send(error);
  }
});

incidentsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  return res.send(id);
  const { data, error } = await supabase
    .from("incidents")
    .select()
    .eq("id", id);
});

incidentsRouter.post(
  "/",
  roleMiddleware(["admin", "maintainer"]),
  async (req, res) => {
    const { title, slug, description, status, severity, is_public } = req.body;
    const { id, role } = req.user;

    try {
      if (!title || !description)
        return res
          .status(400)
          .send({ status: "error", message: "Incomplete Fields" });

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

      if (error)
        return res.status(400).send({ status: "error", message: error });
      return res
        .status(200)
        .send({ status: "success", message: "Incident Created", data });
    } catch (error) {
      return res.status(400).send({ status: "error", message: error });
    }
  },
);

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

      if (!id)
        return res
          .status(400)
          .send({ status: "error", message: "ID Not Passed" });

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
      console.log(data);

      if (!data)
        return res
          .status(400)
          .send({ status: "error", message: "No Incident Found" });
      if (error)
        return res.status(400).send({ status: "error", message: error });

      return res
        .status(200)
        .send({ status: "success", message: "Incident Updated", data });
    } catch (error) {
      return res.status(400).send({ status: "error", message: error });
    }
  },
);
export default incidentsRouter;
