const Report = require("../models/Report");
const Neighborhood = require("../models/Neighborhood");
const { calculateLightScore } = require("./lightScoreService");

/**
 * Recomputes and persists a neighborhood's current status + Light Score based
 * on its most recent report, then broadcasts the change over Socket.IO so
 * connected clients update live. Called after any report is created,
 * confirmed, flagged, or moderated.
 */
async function refreshNeighborhood(io, neighborhoodId) {
  const latest = await Report.findOne({
    neighborhood: neighborhoodId,
    status: { $ne: "rejected" },
  }).sort({ createdAt: -1 });

  let status = "none";
  if (latest) {
    if (latest.status === "flagged") status = "none";
    else if (latest.type === "restoration") status = "available";
    else if (latest.type === "outage" && latest.status === "verified") status = "outage";
    else if (latest.type === "outage") status = "unverified";
  }

  const { value: lightScoreValue } = await calculateLightScore(neighborhoodId);

  const neighborhood = await Neighborhood.findByIdAndUpdate(
    neighborhoodId,
    {
      currentStatus: status,
      "lightScore.value": lightScoreValue,
      "lightScore.lastCalculatedAt": new Date(),
      $push: { "lightScore.history": { value: lightScoreValue } },
    },
    { new: true }
  );

  if (io) io.to(`neighborhood:${neighborhoodId}`).emit("neighborhood:update", neighborhood);
  return neighborhood;
}

module.exports = { refreshNeighborhood };
