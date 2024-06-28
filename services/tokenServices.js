import jwt from "jsonwebtoken";
import { RefreshToken } from "../schemas/usersSchemas.js";

export const generateToken = async (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30m" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return {
    token,
    refreshToken,
  };
};

export const saveToken = async (userId, refreshToken) => {
  const tokenData = await RefreshToken.findOne({ userId });
  if (tokenData) {
    tokenData.refreshToken = refreshToken;
    return tokenData.save();
  }
  const token = await RefreshToken.create({ userId, refreshToken });

  return token;
};
