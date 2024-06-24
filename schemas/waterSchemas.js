import Joi from "joi";

export const addWaterSchema = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().optional(),
    volume: Joi.number().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export const updateWaterSchema = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().optional(),
    volume: Joi.number().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
