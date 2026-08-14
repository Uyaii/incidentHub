import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30m" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
