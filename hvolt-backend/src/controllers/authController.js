const User = require("../models/User");
const { signAuthToken, signResetToken, verifyResetToken } = require("../services/tokenService");

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });

    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();

    const token = signAuthToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    if (user.status === "suspended") return res.status(403).json({ message: "This account has been suspended." });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid email or password." });

    user.lastLoginAt = new Date();
    await user.save();

    const token = signAuthToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// Issues a short-lived reset token. In production this gets emailed as a link;
// wire up your mail provider (SES, Postmark, etc.) where indicated below.
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond the same way whether or not the account exists, to avoid
    // leaking which emails are registered.
    if (user) {
      const resetToken = signResetToken(user);
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      // TODO: send `resetUrl` via your email provider instead of logging it.
      console.log(`[auth] Password reset link for ${user.email}: ${resetUrl}`);
    }
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    let payload;
    try {
      payload = verifyResetToken(token);
    } catch {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }
    if (payload.purpose !== "reset") return res.status(400).json({ message: "Invalid reset token." });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired." });

    await user.setPassword(password);
    await user.save();
    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}


async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+passwordHash");

    const match = await user.comparePassword(currentPassword);

    if (!match) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    await user.setPassword(newPassword);
    await user.save();

    res.json({
      message: "Password changed successfully.",
    });
  } catch (err) {
    next(err);
  }
}


module.exports = { register, login, forgotPassword, resetPassword, me, changePassword };
