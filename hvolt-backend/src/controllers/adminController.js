const Report = require("../models/Report");
const User = require("../models/User");
const Neighborhood = require("../models/Neighborhood");

async function listReports(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reports = await Report.find(filter)
      .populate("neighborhood", "name state lga")
      .populate("reporter", "name email")
      .sort({ createdAt: -1 })
      .limit(300);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
}

async function updateReportStatus(req, res, next) {
  try {
    const { status } = req.body; // "verified" | "rejected" | "flagged"
    if (!["verified", "rejected", "flagged"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found." });

    const io = req.app.get("io");
    io?.to(`neighborhood:${report.neighborhood}`).emit("report:updated", report);

    res.json({ report });
  } catch (err) {
    next(err);
  }
}

async function removeReport(req, res, next) {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });
    res.json({ message: "Report removed." });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("name email role status reportsCount trustScore createdAt");
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { role, status } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function analytics(req, res, next) {
  try {
    const [totalReports, verifiedReports, activeOutages, totalUsers, neighborhoods] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: "verified" }),
      Neighborhood.countDocuments({ currentStatus: "outage" }),
      User.countDocuments(),
      Neighborhood.find().select("name state lightScore.value"),
    ]);

    const avgLightScoreByState = {};
    neighborhoods.forEach((n) => {
      avgLightScoreByState[n.state] = avgLightScoreByState[n.state] || [];
      avgLightScoreByState[n.state].push(n.lightScore.value);
    });
    Object.keys(avgLightScoreByState).forEach((state) => {
      const arr = avgLightScoreByState[state];
      avgLightScoreByState[state] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    });

    res.json({ totalReports, verifiedReports, activeOutages, totalUsers, avgLightScoreByState });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReports, updateReportStatus, removeReport, listUsers, updateUser, analytics };
