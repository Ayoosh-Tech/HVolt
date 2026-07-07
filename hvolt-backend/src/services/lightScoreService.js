const Report = require("../models/Report");

/**
 * Calculates a neighborhood's Light Score (0-100).
 *
 * Weighted inputs:
 *  - Outage frequency (last 30 days)      -> 35%
 *  - Average outage duration              -> 30%
 *  - Community verification ratio         -> 20%
 *  - Restoration speed (time to restore)  -> 15%
 *
 * Each sub-score is normalized to 0-100 before weighting, so the result
 * is always in range and easy to reason about on the frontend.
 */
async function calculateLightScore(neighborhoodId) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reports = await Report.find({
    neighborhood: neighborhoodId,
    createdAt: { $gte: since },
  }).sort({ createdAt: 1 });

  const outages = reports.filter((r) => r.type === "outage" && r.status !== "rejected");
  const restorations = reports.filter((r) => r.type === "restoration");

  // 1) Frequency: fewer outages/month = better. Cap at 20 outages for normalization.
  const frequencyScore = 100 - Math.min(outages.length, 20) * 5;

  // 2) Average duration: pair each outage with the next restoration after it.
  const durationsMin = [];
  outages.forEach((outage) => {
    const nextRestoration = restorations.find((r) => r.createdAt > outage.createdAt);
    if (nextRestoration) {
      durationsMin.push((nextRestoration.createdAt - outage.createdAt) / 60000);
    }
  });
  const avgDuration = durationsMin.length
    ? durationsMin.reduce((a, b) => a + b, 0) / durationsMin.length
    : 0;
  // 6 hours (360 min) or longer outages score 0; instant restoration scores 100.
  const durationScore = Math.max(0, 100 - (avgDuration / 360) * 100);

  // 3) Verification ratio: share of outage reports that reached "verified".
  const verifiedCount = outages.filter((r) => r.status === "verified").length;
  const verificationScore = outages.length ? (verifiedCount / outages.length) * 100 : 100;

  // 4) Restoration speed: reward areas that report restoration quickly (proxy: ratio of
  // outages that have a matching restoration at all, within the window).
  const restorationScore = outages.length
    ? (durationsMin.length / outages.length) * 100
    : 100;

  const weighted =
    frequencyScore * 0.35 +
    durationScore * 0.3 +
    verificationScore * 0.2 +
    restorationScore * 0.15;

  return {
    value: Math.round(Math.max(0, Math.min(100, weighted))),
    breakdown: {
      frequencyScore: Math.round(frequencyScore),
      durationScore: Math.round(durationScore),
      verificationScore: Math.round(verificationScore),
      restorationScore: Math.round(restorationScore),
      outageCount: outages.length,
      averageOutageDurationMinutes: Math.round(avgDuration),
    },
  };
}

function reliabilityLevel(score) {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

module.exports = { calculateLightScore, reliabilityLevel };
