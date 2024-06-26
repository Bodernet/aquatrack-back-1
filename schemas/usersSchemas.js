import mongoose from "mongoose";
import Joi from "joi";

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
  gender: Joi.string().valid("Woman", "Man").optional(),
  weight: Joi.number().default(0).optional(),
  activeTimeSports: Joi.number().default(0).optional(),
  waterDrink: Joi.number().default(1.8).optional(),
});

export const updDataUserSchema = (req, res, next) => {
  const schema = Joi.object({
    name: {
      type: String,
      default: "User",
    },
    gender: {
      type: String,
      enum: ["Woman", "Man"],
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
      enum: ["unknown", "Woman", "Man"],
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
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
