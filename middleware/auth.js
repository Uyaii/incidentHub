import supabase from "../app/utils/db.js";
import { verifyToken } from "../app/utils/tokens.js";

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res
        .status(401)
        .send({ status: "error", message: "No Authorization Header" });

    const token = req.headers.authorization.split(" ")[1];

    const user = verifyToken(token); // ! this returns the payload that was signed in the first place ie id,role etc

    if (!user)
      return res
        .status(401)
        .send({ status: "error", message: "User Not Found" });

    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single();

    if (!data)
      return res
        .status(404)
        .send({ status: "error", message: "User Not Found" });
    if (error) return res.status(404).send({ status: "error", message: error });

    req.user = data;
    console.log(req.user);
  } catch (error) {
    return res.send({ error, message: "flick" });
  }

  next();
};

export default authMiddleware;
