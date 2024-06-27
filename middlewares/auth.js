import jwt from "jsonwebtoken";
import { User } from "../schemas/usersSchemas.js";

async function authMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return res.status(401).send({
      message: "Not authorized! Missing or invalid authorization header.",
    });
  }
  const [bearer, token] = authorizationHeader.split(" ", 2);
  if (bearer !== "Bearer" || !token) {
    return res
      .status(401)
      .send({ message: "Not authorized! Missing or invalid token." });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (error, decode) => {
    if (error) {
      return res
        .status(401)
        .json({ message: "Not authorized! Invalid token!" });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decode.id);
      if (!user || user.token !== token) {
        return res.status(401).json({
          message: "Not authorized! User not found or token mismatch!",
        });
      }

      req.user = { id: user._id, email: user.email };
      next();
    } catch (error) {
      console.log("Authorization error:", error);
      return res
        .status(401)
        .json({ message: "Server error during authorization!" });
    }
  });
}
export default authMiddleware;
