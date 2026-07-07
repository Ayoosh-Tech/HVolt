const Report = require("../models/Report");
const User = require("../models/User");
const { refreshNeighborhood } = require("../services/neighborhoodService");

async function list(req, res, next) {
  try {
    const { neighborhood, status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (neighborhood) filter.neighborhood = neighborhood;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const reports = await Report.find(filter)
      .populate("neighborhood", "name state lga")
      .populate("reporter", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments(filter);
    res.json({ reports, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// Report an outage or a restoration, with duplicate-report protection.
async function create(req, res, next) {
  try {
    const { type, neighborhood, lat, lng, comment = "" } = req.body;

    const windowMinutes = Number(process.env.DUPLICATE_REPORT_WINDOW_MINUTES || 5);
    const since = new Date(Date.now() - windowMinutes * 60000);
    const recentDuplicate = await Report.findOne({
      reporter: req.user._id,
      neighborhood,
      type,
      createdAt: { $gte: since },
    });
    if (recentDuplicate) {
      return res.status(429).json({
        message: `You already submitted a ${type} report for this area recently. Please wait before reporting again.`,
      });
    }

    const report = await Report.create({
      type,
      neighborhood,
      reporter: req.user._id,
      location: { type: "Point", coordinates: [lng, lat] },
      comment,
      confirmations: [{ user: req.user._id }],
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { reportsCount: 1 } });

    const io = req.app.get("io");
    const populated = await report.populate("reporter", "name");
    io?.to(`neighborhood:${neighborhood}`).emit("report:new", populated);

    const updatedNeighborhood = await refreshNeighborhood(io, neighborhood);

    // If this is a restoration, notify users following the affected location.
    if (type === "restoration") {
      const followers = await User.find({ followedNeighborhoods: neighborhood });
      followers.forEach((f) =>
        io?.to(`user:${f._id}`).emit("notification", {
          type: "restoration",
          neighborhood: updatedNeighborhood.name,
          message: `Power has been restored in ${updatedNeighborhood.name}.`,
        })
      );
    }

    res.status(201).json({ report: populated, neighborhood: updatedNeighborhood });
  } catch (err) {
    next(err);
  }
}

// Community verification: confirm a report.
async function confirm(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });

    const alreadyConfirmed = report.confirmations.some((c) => c.user.toString() === req.user._id.toString());
    if (alreadyConfirmed) return res.status(409).json({ message: "You already confirmed this report." });

    report.confirmations.push({ user: req.user._id });

    const requiredConfirmations = Number(process.env.AUTO_VERIFY_CONFIRMATIONS || 5);
    if (report.confirmations.length >= requiredConfirmations && report.status === "unverified") {
      report.status = "verified";
    }
    await report.save();

    const io = req.app.get("io");
    const neighborhood = await refreshNeighborhood(io, report.neighborhood);
    io?.to(`neighborhood:${report.neighborhood}`).emit("report:updated", report);

    res.json({ report, neighborhood });
  } catch (err) {
    next(err);
  }
}

// Flag a report as false; auto-escalates to "flagged" after 3 independent flags.
async function flag(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found." });

    report.flags.push({ user: req.user._id, reason: req.body.reason || "" });
    if (report.flags.length >= 3) report.status = "flagged";
    await report.save();

    const io = req.app.get("io");
    const neighborhood = await refreshNeighborhood(io, report.neighborhood);

    res.json({ report, neighborhood });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, confirm, flag };
