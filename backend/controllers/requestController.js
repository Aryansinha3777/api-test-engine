const SavedRequest = require("../models/SavedRequest");


const getAllRequests = async (req, res) => {
  try {
    const requests = await SavedRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved requests", details: err.message });
  }
};


const getRequestById = async (req, res) => {
  try {
    const request = await SavedRequest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!request) {
      return res.status(404).json({ error: "Saved request not found" });
    }
    res.json({ success: true, data: request });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    res.status(500).json({ error: "Failed to fetch request", details: err.message });
  }
};


const createRequest = async (req, res) => {
  try {
    const { name, url, method, headers, body, description } = req.body;

    if (!name || !url || !method) {
      return res.status(400).json({ error: "name, url, and method are required" });
    }

    const saved = await SavedRequest.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to save request", details: err.message });
  }
};


const updateRequest = async (req, res) => {
  try {
    const { name, url, method, headers, body, description } = req.body;

    const updated = await SavedRequest.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // ← userId check added
      { name, url, method, headers, body, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Saved request not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to update request", details: err.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const deleted = await SavedRequest.findOneAndDelete(
      { _id: req.params.id, userId: req.user._id } // ← userId check added
    );
    if (!deleted) {
      return res.status(404).json({ error: "Saved request not found" });
    }
    res.json({ success: true, message: "Request deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    res.status(500).json({ error: "Failed to delete request", details: err.message });
  }
};


const deleteAllRequests = async (req, res) => {
  try {
    const result = await SavedRequest.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: `Deleted ${result.deletedCount} requests` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete requests", details: err.message });
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  deleteAllRequests,
};