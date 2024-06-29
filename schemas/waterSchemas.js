import Joi from "joi";

export const addWaterSchema = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.string().isoDate().optional(),
    volume: Joi.number().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: `${error.details[0].message}. Correct format for date is 'YYYY-MM-DD'`,
      example: {
        date: "2024-06-26",
        volume: 500,
      },
    });
  }
  next();
};

export const updateWaterSchema = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    volume: Joi.number().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: `${error.details[0].message}. Correct format for date is 'YYYY-MM-DD'`,
      example: {
        date: "2024-06-26",
        volume: 500,
      },
    });
  }
  next();
};

export const getDailyWaterSchema = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: `${error.details[0].message}. Correct format is 'YYYY-MM-DD'`,
      example: {
        date: "2024-06-26",
      },
    });
  }
  next();
};

export const getMonthlyWaterSchema = (req, res, next) => {
  const schema = Joi.object({
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().min(1900).max(2100).optional(),
  });
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      message: `${error.details[0].message}. Correct format is 'month: 1-12' and 'year: 1900-2100'`,
      example: {
        month: 6,
        year: 2024,
      },
    });
  }
  next();
};
