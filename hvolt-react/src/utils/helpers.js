// Pure helper functions shared across the app. Nothing here touches React
// state directly, so these are easy to unit test in isolation.

export const STATUS_COLOR = {
  available: "#1FA463",
  outage: "#E8483A",
  unverified: "#F2B705",
  none: "#9AA6A0",
};

export const STATUS_LABEL_KEY = {
  available: "available",
  outage: "confirmedOutage",
  unverified: "unverified",
  none: "noReports",
};

// Derives a neighborhood's current status from its most recent (non-flagged)
// report. Mirrors the rules used by the backend's refreshNeighborhood().
export function neighborhoodStatus(reports, neighborhoodId) {
  const reps = reports
    .filter((r) => r.neighborhoodId === neighborhoodId)
    .sort((a, b) => b.ts - a.ts);
  if (reps.length === 0) return "none";
  const latest = reps[0];
  // The real backend can also mark a report "rejected" via admin moderation —
  // treat that the same as "flagged": it shouldn't drive the map/dashboard status.
  if (latest.status === "flagged" || latest.status === "rejected") return "none";
  if (latest.type === "restoration") return "available";
  if (latest.type === "outage" && latest.status === "verified") return "outage";
  if (latest.type === "outage" && latest.status === "unverified") return "unverified";
  return "none";
}

// Returns true if `report` is the most recent report for its neighborhood.
export function isLatestReport(reports, report) {
  const same = reports
    .filter((r) => r.neighborhoodId === report.neighborhoodId)
    .sort((a, b) => b.ts - a.ts);
  return same[0]?.id === report.id;
}

export function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function validEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function reliabilityLabel(score, t) {
  if (score >= 70) return t("high");
  if (score >= 45) return t("medium");
  return t("low");
}

export function gaugeColorVar(score) {
  if (score >= 70) return "var(--green)";
  if (score >= 45) return "var(--amber)";
  return "var(--red)";
}

export function statusBadgeBg(status) {
  return status === "verified" ? "#1FA46322" : status === "flagged" || status === "rejected" ? "#E8483A22" : "#F2B70522";
}

export function statusBadgeFg(status) {
  return status === "verified" ? "var(--green)" : status === "flagged" || status === "rejected" ? "var(--red)" : "var(--amber)";
}
