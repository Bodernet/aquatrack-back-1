import mongoose from "mongoose";
import Joi from "joi";
import { Schema, model } from "mongoose";

export const registerSchema = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(86).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const newPasswordSchema = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const loginSchema = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(86).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const verifySchema = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().trim().allow(null, "").optional(),
  gender: Joi.string().valid("woman", "man").optional(),
  weight: Joi.number().default(0).optional(),
  activeTimeSports: Joi.number().default(0).optional(),
  waterDrink: Joi.number().default(1.8).optional(),
});

export const updDataUserSchema = (req, res, next) => {
  const schema = Joi.object({
    name: {
      type: String,
      // default: "User",
    },
    gender: {
      type: String,
      enum: ["woman", "man"],
    },
    weight: {
      type: Number,
      // default: 0,
    },
    activeTimeSports: {
      type: Number,
      // default: 0,
    },
    waterDrink: {
      type: Number,
      default: 1.8,
      avatarURL: {
        type: string,
      },
    },
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Aquaman",
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 86,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    gender: {
      type: String,
      enum: ["unknown", "woman", "man"],
      default: "unknown",
    },
    weight: {
      type: Number,
      default: 0,
    },
    activeTimeSports: {
      type: Number,
      default: 0,
    },
    waterDrink: {
      type: Number,
      default: 1.8,
    },
    token: {
      type: String,
      default: null,
    },
    tmpToken: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      // default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      // required: [true, "Verify token is required"],
    },
    displayName: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const TokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

export const User = mongoose.model("User", userSchema);
export const RefreshToken = model("RefreshToken", TokenSchema);
