/**
 * ============================================================
 * Wellness Controller — Daily Health Tracker
 * ============================================================
 * Manages patient wellness logs: retrieving today's entry,
 * creating/updating daily metrics (heart rate, BP, etc.) and
 * goals (steps, water, sleep), and fetching 7-day history.
 * ============================================================
 */

const Wellness = require('../models/Wellness');

/**
 * @desc    Get today's wellness log for the authenticated patient
 * @route   GET /api/wellness/today
 * @access  Private (Patient only)
 *
 * Returns empty default values if no entry exists for today.
 */
const getTodayWellness = async (req, res, next) => {
  try {
    // Set to midnight of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let wellness = await Wellness.findOne({
      patient: req.user._id,
      date: today,
    });

    // Return empty schema if no entry exists yet
    if (!wellness) {
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

/**
 * @desc    Update or create today's wellness log (upsert behavior)
 * @route   POST /api/wellness/today
 * @access  Private (Patient only)
 */
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
      // Update existing entry — merge new values with existing
      wellness.metrics = { ...wellness.metrics, ...metrics };
      wellness.goals = { ...wellness.goals, ...goals };
      await wellness.save();
    } else {
      // Create new entry for today
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

/**
 * @desc    Get the last 7 days of wellness history
 * @route   GET /api/wellness/history
 * @access  Private (Patient only)
 */
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
