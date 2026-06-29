const mongoose = require("mongoose");

const requestHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      uppercase: true,
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Response info
    statusCode: {
      type: Number,
      default: null,
    },
    responseTime: {
      type: Number, // ms
      default: null,
    },
    responseSize: {
      type: Number, // bytes
      default: null,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

requestHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("RequestHistory", requestHistorySchema);