import "dotenv/config";
import path from "node:path";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import waterRouter from "./routes/waterRouter.js";
import "./db/db.js";
import authMiddleware from "./middlewares/auth.js";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use("/avatars", express.static(path.resolve("public/avatars")));

app.use("/api/users", userRouter);
app.use("/api/water", authMiddleware, waterRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running. Use our API on port: ${PORT}`);
});
