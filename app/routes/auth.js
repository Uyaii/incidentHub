import { Router } from "express";
import { prisma } from "../config/db.js";
import { uuidv7 } from "uuidv7";
import bcrypt from "bcrypt";
const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    if (email === "" || password === "" || fullName === "") {
      return res
        .status(400)
        .send({ status: "error", message: "Missing Field" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
      },
    });

    return res.status(201).send({
      status: "success",
      message: "User Created!",
      user,
    });
  } catch (error) {
    console.log(error);

    return res.send(error);
  }
});

export default authRouter;
