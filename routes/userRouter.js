import express from "express";
import {
  register,
  login,
  logout,
  current,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authControllers.js";
import { updAvatar, updDataUser } from "../controllers/usersControllers.js";
import authMiddleware from "../middlewares/auth.js";
import {
  registerSchema,
  loginSchema,
  verifySchema,
} from "../schemas/usersSchemas.js";
import uploadMiddleware from "../middlewares/uploadFileAvatar.js";

const userRouter = express.Router();

userRouter.post("/register", registerSchema, register);
userRouter.post("/login", loginSchema, login);
userRouter.post("/logout", authMiddleware, logout);
userRouter.get("/current", authMiddleware, current);
userRouter.get("/verify/:verificationToken", verifyEmail);
userRouter.post("/verify", verifySchema, resendVerificationEmail);

userRouter.patch(
  "/update",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  updDataUser
);
userRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  updAvatar
);

export default userRouter;
