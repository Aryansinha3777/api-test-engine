const mongoose = require("mongoose");

const environmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Environment name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    variables: [
      {
        key: { type: String, required: true, trim: true },
        value: { type: String, default: "", trim: true },
      },
    ],
  },
  { timestamps: true }
);

environmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Environment", environmentSchema);