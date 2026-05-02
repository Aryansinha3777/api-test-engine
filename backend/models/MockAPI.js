const mongoose = require("mongoose");

const mockAPISchema = new mongoose.Schema(
  {
    
    endpointPath: {
      type: String,
      required: [true, "Endpoint path is required"],
      trim: true,
      
      set: (v) => v.replace(/^\/+/, ""),
    },
    method: {
      type: String,
      required: [true, "HTTP method is required"],
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      uppercase: true,
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Response body is required"],
    },
    statusCode: {
      type: Number,
      default: 200,
      min: [100, "Status code must be >= 100"],
      max: [599, "Status code must be <= 599"],
    },
    
    responseHeaders: {
      type: Map,
      of: String,
      default: { "Content-Type": "application/json" },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  
    hitCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


mockAPISchema.index({ endpointPath: 1, method: 1 }, { unique: true });

module.exports = mongoose.model("MockAPI", mockAPISchema);