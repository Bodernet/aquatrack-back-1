import express from "express";
import {
  addWater,
  updateWater,
  deleteWater,
  getDailyWater,
  getMonthlyWater,
} from "../controllers/waterControllers.js";
import {
  addWaterSchema,
  updateWaterSchema,
  getDailyWaterSchema,
  getMonthlyWaterSchema,
} from "../schemas/waterSchemas.js";

const waterRouter = express.Router();

waterRouter.post(
  "/",
  // addWaterSchema,
  addWater
);
waterRouter.patch(
  "/:id",
  // updateWaterSchema,
  updateWater
);
waterRouter.delete("/:id", deleteWater);
waterRouter.get("/daily", getDailyWaterSchema, getDailyWater);
waterRouter.get("/monthly", getMonthlyWaterSchema, getMonthlyWater);

export default waterRouter;
