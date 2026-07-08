const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["outage", "restoration"], required: true },
    status: {
      type: String,
      enum: ["unverified", "verified", "flagged", "rejected", "withdrawn"],
      default: "unverified",
    },
    neighborhood: { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood", required: true, index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat] — user-editable, defaults to GPS capture
    },
    comment: { type: String, maxlength: 500, default: "" },
    confirmations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    flags: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: Date, // set when a matching restoration report closes this outage
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

reportSchema.index({ location: "2dsphere" });
reportSchema.index({ neighborhood: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
