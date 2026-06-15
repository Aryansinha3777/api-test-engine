const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


const connectDB = async () => {
  // In serverless, this file can be re-invoked without a fresh process restart.
  // Reuse the existing connection if one is already open/connecting.
  if (mongoose.connection.readyState >= 1) return;

  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/api-test-engine"
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (require.main === module) process.exit(1);
  }
};

connectDB();


app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/mock", require("./routes/mockRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/environments", require("./routes/environmentRoutes"));



app.use("/mock", require("./routes/mockServerRoutes"));


app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API Test Engine is running",
    timestamp: new Date().toISOString(),
  });
});


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});


const PORT = process.env.PORT || 5000;

// Vercel runs this file as a serverless function and never calls app.listen.
// Locally (npm run dev / node server.js), we still want the usual listen.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   API Base:    http://localhost:${PORT}/api`);
    console.log(`   Mock Server: http://localhost:${PORT}/mock`);
    console.log(`   Health:      http://localhost:${PORT}/health`);
  });
}

module.exports = app;