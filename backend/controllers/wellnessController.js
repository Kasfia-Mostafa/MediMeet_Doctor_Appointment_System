const Wellness = require('../models/Wellness');

// Get today's wellness log
const getTodayWellness = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let wellness = await Wellness.findOne({
      patient: req.user._id,
      date: today,
    });

    if (!wellness) {
      // Return empty schema if not found
      return res.json({
        metrics: { heartRate: 0, bloodPressure: '', temperature: 0, oxygen: 0, weight: 0 },
        goals: { steps: 0, water: 0, sleep: 0 }
      });
    }

    res.json(wellness);
  } catch (error) {
    next(error);
  }
};

// Update or create today's wellness log
const updateWellness = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { metrics, goals } = req.body;

    let wellness = await Wellness.findOne({
      patient: req.user._id,
      date: today,
    });

    if (wellness) {
      // Update existing
      wellness.metrics = { ...wellness.metrics, ...metrics };
      wellness.goals = { ...wellness.goals, ...goals };
      await wellness.save();
    } else {
      // Create new
      wellness = await Wellness.create({
        patient: req.user._id,
        date: today,
        metrics,
        goals,
      });
    }

    res.json(wellness);
  } catch (error) {
    next(error);
  }
};

// Get recent history
const getWellnessHistory = async (req, res, next) => {
  try {
    const history = await Wellness.find({ patient: req.user._id })
      .sort({ date: -1 })
      .limit(7); // Last 7 days
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTodayWellness, updateWellness, getWellnessHistory };
