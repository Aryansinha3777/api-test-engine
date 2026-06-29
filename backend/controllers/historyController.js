const RequestHistory = require("../models/RequestHistory");

// GET /api/history — latest 50 entries
const getHistory = async (req, res) => {
  try {
    const history = await RequestHistory.find({ userId: req.user._id })
  .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", details: err.message });
  }
};

// DELETE /api/history — wipe all history
const clearHistory = async (req, res) => {
  try {
    const result = await RequestHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: `Cleared ${result.deletedCount} entries` });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history", details: err.message });
  }
};

module.exports = { getHistory, clearHistory };