import path from "path";
import Jimp from "jimp";
import fs from "fs/promises";
import { User } from "../schemas/usersSchemas.js";
import { updateUserSchema } from "../schemas/usersSchemas.js";
import { v2 as cloudinary } from "cloudinary";

export const updDataUser = async (req, res) => {
  try {
    const { email, name, gender, weight, activeTimeSports, waterDrink } =
      req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Update unsuccessful." });
    }
    const userData = {
      email,
      name: name ? name.trim() : "",
      gender,
      weight,
      activeTimeSports,
      waterDrink,
    };
    const { error, value } = updateUserSchema.validate(userData);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    await User.findByIdAndUpdate(req.user.id, value, { new: true });
    res.status(200).json({
      message: "Update successful",
      value,
    });
  } catch (error) {
    console.error("Error updating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export async function updAvatar(req, res, next) {
//   cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });
//   const options = {
//     use_filename: true,
//     unique_filename: true,
//     overwrite: false,
//     transformation: [
//       { width: 200, height: 200, gravity: "faces", crop: "thumb" },
//       { radius: "max" },
//     ],
//   };
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "You must add a file" });
//     }
//     const result = await cloudinary.uploader.upload(req.file.path, options);
//     await fs.unlink(req.file.path);
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { avatarURL: result.secure_url },
//       { new: true }
//     );
//     if (user) {
//       res.status(200).json({
//         avatarURL: user.avatarURL,
//       });
//     } else {
//       return res.status(404).json("User not found");
//     }
//   } catch (error) {
//     console.error("Error updating avatar:", error);
//     res.status(500).json({ message: error.message });
//   }
// }

export async function updAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "You must add a file" });
    }
    const newPath = path.resolve("public", "avatars", req.file.filename);
    const avaURL = path.join("avatars", req.file.filename);
    Jimp.read(req.file.path)
      .then((file) => {
        return file.resize(200, 200).quality(60).write(newPath);
      })
      .catch((err) => {
        console.error(err);
      });

    await fs.rename(req.file.path, newPath);
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: avaURL },
      { new: true }
    );
    if (user) {
      res.status(200).json({
        avatarURL: user.avatarURL,
      });
    } else {
      return res.status(404).json("Not found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
