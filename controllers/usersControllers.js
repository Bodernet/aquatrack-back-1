import path from "path";
import Jimp from "jimp";
import fs from "fs/promises";
import { User } from "../schemas/usersSchemas.js";
import { updateUserSchema } from "../schemas/usersSchemas.js";
import { v2 as cloudinary } from "cloudinary";

// done

export const updDataUser = async (req, res) => {
  const id = req.user.id.toString();

  try {
    const dataToUpdate = { ...req.body };
    if (dataToUpdate.weight === null) dataToUpdate.weight = 0;
    if (dataToUpdate.activeTimeSports === null)
      dataToUpdate.activeTimeSports = 0;

    const { error, value } = updateUserSchema.validate(dataToUpdate);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const updatedUser = await User.findByIdAndUpdate(id, value, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Update successful",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        weight: updatedUser.weight,
        activeTimeSports: updatedUser.activeTimeSports,
        waterDrink: updatedUser.waterDrink,
        avatarURL: updatedUser.avatarURL,
      },
    });
  } catch (error) {
    console.error("Error updating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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

// planned

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
