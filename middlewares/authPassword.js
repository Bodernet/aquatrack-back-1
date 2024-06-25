import jwt from "jsonwebtoken";
import { User } from "../schemas/usersSchemas.js";

async function authPasswordMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (typeof authorizationHeader !== "string") {
    return res.status(401).send({ message: "Not authorized!" });
  }
  const [bearer, token] = authorizationHeader.split(" ", 2);
  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized!" });
  }
  if (!token) {
    return res.status(401).send({ message: "Not authorized!" });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);

    if (!user || user.tmpToken !== token) {
      return res.status(403).json({ message: "No access to data!" });
    }

    req.user = user;

    await User.findByIdAndUpdate(id, { tmpToken: null });

    next();
  } catch (error) {
    console.log("Authorization error:", error);
    return res.status(401).json({ message: "Not authorized!" });
  }
}

export default authPasswordMiddleware;
