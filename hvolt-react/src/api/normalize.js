// The React components were originally built against the flat mock-data shape
// (see the old src/data/mockData.js). Rather than rewrite every component to
// understand Mongo's nested documents, these functions adapt each API
// response into that same flat shape — so Dashboard.jsx, MapView.jsx,
// AdminDashboard.jsx, etc. all keep working completely unchanged.

// Neighborhood: { _id, name, state, lga, location: { coordinates: [lng, lat] }, lightScore: { value } }
// -> { id, name, state, lga, lat, lng, score }
export function normalizeNeighborhood(n) {
  const [lng, lat] = n.location?.coordinates || [0, 0];
  return {
    id: n._id || n.id,
    name: n.name,
    state: n.state,
    lga: n.lga,
    lat,
    lng,
    score: n.lightScore?.value ?? 50,
  };
}

// Report: { _id, neighborhood, type, status, confirmations: [...], reporter, comment, createdAt }
// -> { id, neighborhoodId, type, status, confirmations (count), reporter (name), comment, ts }
export function normalizeReport(r) {
  const neighborhoodId =
    r.neighborhood && typeof r.neighborhood === "object" ? r.neighborhood._id : r.neighborhood;
  const reporterName = r.reporter && typeof r.reporter === "object" ? r.reporter.name : r.reporter || "Unknown";
  const reporterId = r.reporter && typeof r.reporter === "object" ? r.reporter._id : r.reporter || null;

  return {
    id: r._id || r.id,
    neighborhoodId,
    type: r.type,
    status: r.status,
    confirmations: Array.isArray(r.confirmations) ? r.confirmations.length : r.confirmations || 0,
    reporter: reporterName,
    reporterId,
    comment: r.comment || "",
    ts: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
  };
}

// User: { _id, name, email, role, reportsCount } (admin list) or the auth
// `toSafeJSON()` shape ({ id, name, email, role, reportsCount, ... })
// -> { id, name, email, role, reports }
export function normalizeUser(u) {
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    reports: u.reportsCount ?? u.reports ?? 0,
  };
}
