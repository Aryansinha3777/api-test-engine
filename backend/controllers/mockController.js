const MockAPI = require("../models/MockAPI");

const getAllMocks = async (req, res) => {
  try {
    const mocks = await MockAPI.find({ userId: req.user._id });
    res.json({ success: true, count: mocks.length, data: mocks });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mock APIs", details: err.message });
  }
};

const getMockById = async (req, res) => {
  try {
    const mock = await MockAPI.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mock) return res.status(404).json({ error: "Mock API not found" });
    res.json({ success: true, data: mock });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid mock ID" });
    res.status(500).json({ error: "Failed to fetch mock API", details: err.message });
  }
};

const createMock = async (req, res) => {
  try {
    const { endpointPath, method, responseBody } = req.body;

    if (!endpointPath || !method || responseBody === undefined) {
      return res.status(400).json({
        error: "endpointPath, method, and responseBody are required",
      });
    }

    const mock = await MockAPI.create({ ...req.body, userId: req.user._id });

    res.status(201).json({
      success: true,
      data: mock,
      mockUrl: `/mock/${mock.endpointPath}`,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: `A mock for ${req.body.method?.toUpperCase()} /${req.body.endpointPath} already exists`,
      });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create mock API", details: err.message });
  }
};

const updateMock = async (req, res) => {
  try {
    const { endpointPath, method, responseBody, statusCode, responseHeaders, description } =
      req.body;

    // findOne with userId ensures a user can only update their own mock
    const mock = await MockAPI.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mock) return res.status(404).json({ error: "Mock API not found" });

    const updated = await MockAPI.findByIdAndUpdate(
      req.params.id,
      { endpointPath, method: method?.toUpperCase(), responseBody, statusCode, responseHeaders, description },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updated,
      mockUrl: `/mock/${updated.endpointPath}`,
    });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid mock ID" });
    if (err.code === 11000) {
      return res.status(409).json({ error: "A mock with that path+method already exists" });
    }
    if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to update mock API", details: err.message });
  }
};

const deleteMock = async (req, res) => {
  try {
    const deleted = await MockAPI.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Mock API not found" });
    res.json({ success: true, message: "Mock API deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid mock ID" });
    res.status(500).json({ error: "Failed to delete mock API", details: err.message });
  }
};

const resetHits = async (req, res) => {
  try {
    const updated = await MockAPI.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { hitCount: 0 },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Mock API not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset hits", details: err.message });
  }
};

module.exports = { getAllMocks, getMockById, createMock, updateMock, deleteMock, resetHits };