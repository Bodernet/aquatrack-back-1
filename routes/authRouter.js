import express from "express";
import {
  register,
  login,
  logout,
  current,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authControllers.js";
import authMiddleware from "../middlewares/auth.js";
import {
  registerSchema,
  loginSchema,
  verifySchema,
} from "../schemas/usersSchemas.js";

const authRouter = express.Router();

authRouter.post("/register", registerSchema, register);
authRouter.post("/login", loginSchema, login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/current", authMiddleware, current);
authRouter.get("/verify/:verificationToken", verifyEmail);
authRouter.post("/verify", verifySchema, resendVerificationEmail);

export default authRouter;
