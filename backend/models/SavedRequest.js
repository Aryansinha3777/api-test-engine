const mongoose = require("mongoose");

const savedRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Request name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    method: {
      type: String,
      required: [true, "HTTP method is required"],
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
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("SavedRequest", savedRequestSchema);