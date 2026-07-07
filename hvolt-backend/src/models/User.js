const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    reportsCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    preferredLanguage: { type: String, enum: ["en", "ha"], default: "en" },
    followedNeighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    reportsCount: this.reportsCount,
    trustScore: this.trustScore,
    preferredLanguage: this.preferredLanguage,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
