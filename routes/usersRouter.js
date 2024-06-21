import express from "express";
import {
  updAvatar,
  updDataUser,
  getDataUser,
} from "../controllers/usersControllers.js";
import authMiddleware from "../middlewares/auth.js";
import uploadMiddleware from "../middlewares/uploadFileAvatar.js";

const usersRouter = express.Router();

usersRouter.get("/", authMiddleware, getDataUser);
usersRouter.patch(
  "/update",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  updDataUser
);
usersRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  updAvatar
);

export default usersRouter;
