const jwt = require("jsonwebtoken");

function signAuthToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function signResetToken(user) {
  return jwt.sign({ sub: user._id.toString(), purpose: "reset" }, process.env.JWT_RESET_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || "15m",
  });
}

function verifyResetToken(token) {
  return jwt.verify(token, process.env.JWT_RESET_SECRET);
}

module.exports = { signAuthToken, signResetToken, verifyResetToken };
