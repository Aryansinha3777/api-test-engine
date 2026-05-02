const MockAPI = require("../models/MockAPI");

const serveMock = async (req, res) => {
  try {
    
    const rawPath = req.path.replace(/^\/+/, "");
    const method = req.method.toUpperCase();

    
    const mock = await MockAPI.findOne({
      endpointPath: rawPath,
      method,
    });

    if (!mock) {
      return res.status(404).json({
        error: "No mock endpoint found",
        requestedPath: `/mock/${rawPath}`,
        requestedMethod: method,
        hint: "Create a mock for this path in the Mock APIs tab",
      });
    }

    
    MockAPI.findByIdAndUpdate(mock._id, { $inc: { hitCount: 1 } }).exec();

    
    if (mock.responseHeaders && mock.responseHeaders.size > 0) {
      for (const [key, value] of mock.responseHeaders.entries()) {
        res.setHeader(key, value);
      }
    }

    
    if (!res.getHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json");
    }

    
    return res.status(mock.statusCode).json(mock.responseBody);
  } catch (err) {
    console.error("Mock server error:", err.message);
    return res.status(500).json({ error: "Mock server error", details: err.message });
  }
};

module.exports = { serveMock };