const mongoose = require("mongoose");

const neighborhoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, index: true },
    lga: { type: String, required: true, index: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    currentStatus: {
      type: String,
      enum: ["available", "outage", "unverified", "none"],
      default: "none",
    },
    lightScore: {
      value: { type: Number, default: 50, min: 0, max: 100 },
      history: [
        {
          value: Number,
          recordedAt: { type: Date, default: Date.now },
        },
      ],
      lastCalculatedAt: Date,
    },
    stats: {
      totalOutages: { type: Number, default: 0 },
      totalRestorations: { type: Number, default: 0 },
      averageOutageDurationMinutes: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

neighborhoodSchema.index({ location: "2dsphere" });
neighborhoodSchema.index({ name: "text", lga: "text", state: "text" });

module.exports = mongoose.model("Neighborhood", neighborhoodSchema);
