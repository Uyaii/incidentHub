import { Router } from "express";
import { uuidv7 } from "uuidv7";
import bcrypt from "bcrypt";
import supabase from "../utils/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/tokens.js";
const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    if (!email || !password || !full_name) {
      return res
        .status(400)
        .send({ status: "error", message: "Missing Field" });
    }

    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("email", email);
    console.log(data);

    if (error) return res.send({ status: "error", message: error });

    // ! User Already Exists
    if (data.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "Profile already exists",
        data,
      });
    }
    // ! Numeric Name Error Handling
    if (typeof full_name !== "string") {
      return res.status(422).send({
        status: "error",
        message: "Numeric Name instead of String",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .insert(
        { id: uuidv7(), email, password_hash: hashedPassword, full_name },
        { onConflict: "email" },
      )
      .select();
    if (usersError)
      return res.status(400).send({ status: "error", message: usersError });
    return res.status(201).send({
      status: "success",
      message: "User Created!",
      usersData,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }

    return res.status(500).json(error);
  }
});

// ! Normal admin/maintainer register from jump
// * Can never work use an array instead ==> "/register/admin" && "/register/maintainer",
authRouter.post(
  ["/register/admin", "/register/maintainer"],
  async (req, res) => {
    const { email, password, full_name, role } = req.body;
    try {
      if (!email || !password || !full_name || !role) {
        return res
          .status(400)
          .send({ status: "error", message: "Missing Field" });
      }

      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email);
      console.log(data);

      if (error) return res.send({ status: "error", message: error });

      // ! User Already Exists
      if (data.length >= 1) {
        if (data[0].role === "viewer") {
          return res.status(201).send({
            status: "success",
            message: "User Exists as Viewer",
            data,
          });
        } else if (data[0].role === "admin" || data[0].role === "maintainer") {
          return res.status(201).send({
            status: "success",
            message: `User Already Exists As ${role}`,
            data,
          });
        }
      }
      // ! Numeric Name Error Handling
      if (typeof full_name !== "string") {
        return res.status(422).send({
          status: "error",
          message: "Numeric Name instead of String",
        });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .insert(
          {
            id: uuidv7(),
            email,
            password_hash: hashedPassword,
            full_name,
            role,
          },
          { onConflict: "email" },
        )
        .select();
      if (usersError)
        return res.status(400).send({ status: "error", message: usersError });
      return res.status(201).send({
        status: "success",
        message: "User Created!",
        usersData,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
      }

      return res.status(500).json(error);
    }
  },
);

// ! Converting viewer to admin/maintainer
authRouter.post(
  ["/register/convert/admin", "/register/convert/maintainer"],
  async (req, res) => {},
);

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res
        .status(400)
        .send({ status: "error", message: "Missing Fields" });

    const { data: user, error: userError } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();
    if (userError) return res.send({ status: "error", message: userError });

    const pass = await bcrypt.compare(password, user.password_hash);

    //! Invalid/Incorrect Password
    if (!pass)
      return res.send({ status: "error", message: "Invalid Password" });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const hashedToken = hashToken(refreshToken);

    const { data, error } = await supabase
      .from("tokens")
      .upsert(
        {
          id: uuidv7(),
          user_id: user.id,
          token_hash: hashedToken,
          expires_at: new Date(Date.now() + 5 * 60 * 1000),
          created_at: new Date(),
        },
        { onConflict: "user_id" },
      )
      .select();

    if (error) return res.status(400).send({ status: "error", message: error });
    return res.status(200).send({
      message: "Login Successful",
      data,
      user,
      accessToken,
    });
  } catch (error) {
    return res.send(error);
  }
});
export default authRouter;
