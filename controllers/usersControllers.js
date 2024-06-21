import path from "path";
import Jimp from "jimp";
import fs from "fs/promises";
import { User } from "../schemas/usersSchemas.js";
import { updDataUserSchema } from "../schemas/usersSchemas.js";

export const updDataUser = async (req, res) => {
  try {
    const { email, name, gender, weight, activeTimeSports, waterDrink } =
      req.body;
    console.log(req);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Update data unsuccessful!" });
    }
    const result = updDataUserSchema.validate({
      email: email,
      name: name.trim(),
      gender: gender,
      weight: weight,
      activeTimeSports: activeTimeSports,
      waterDrink: waterDrink,
    });
    if (!result) {
      return res.status(400).json({ message: error.message });
    }
    const updUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        email,
        name: name.trim(),
        gender,
        weight,
        activeTimeSports,
        waterDrink,
      },
      { new: true }
    );
    if (!updUser) {
      return res.status(401).json({ message: error.message });
    }
    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    console.error("Error updating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDataUser = async (req, res) => {};

export async function updAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "You must add a file" });
    }
    const newPath = path.resolve("public", "avatars", req.file.filename);
    const avaURL = path.join("avatars", req.file.filename);
    Jimp.read(req.file.path)
      .then((file) => {
        return file.resize(250, 250).quality(60).write(newPath);
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
