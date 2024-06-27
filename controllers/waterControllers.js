import { Water } from "../models/water.js";

export const addWater = async (req, res) => {
  try {
    const { date, volume } = req.body;
    const userId = req.user.id;

    const newWaterEntry = await Water.create({
      user: userId,
      date: date ? new Date(date) : new Date(),
      volume,
    });

    res.status(201).json(newWaterEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWater = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, volume } = req.body;
    const userId = req.user.id;

    const updatedWaterEntry = await Water.findOneAndUpdate(
      { _id: id, user: userId },
      { date: date ? new Date(date) : undefined, volume },
      { new: true }
    );

    if (!updatedWaterEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json(updatedWaterEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWater = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedWaterEntry = await Water.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedWaterEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    const waterEntries = await Water.find({
      user: userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    res.status(200).json(waterEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyWater = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month
      ? parseInt(req.query.month, 10)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year, 10)
      : new Date().getFullYear();

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year format" });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const waterEntries = await Water.find({
      user: userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    res.status(200).json(waterEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
