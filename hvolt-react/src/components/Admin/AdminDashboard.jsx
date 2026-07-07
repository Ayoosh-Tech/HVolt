import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { EmptyIcon } from "../../utils/icons.jsx";
import { gaugeColorVar, statusBadgeBg, statusBadgeFg, timeAgo } from "../../utils/helpers.js";

export default function AdminDashboard() {
  const { adminTab, setAdminTab } = useApp();
  const { t } = useTranslation();

  return (
    <>
      <h1>{t("adminHeading")}</h1>
      <p className="lede">{t("adminLede")}</p>
      <div className="tabs">
        <button className={adminTab === "reports" ? "active" : ""} onClick={() => setAdminTab("reports")}>
          {t("tabReports")}
        </button>
        <button className={adminTab === "users" ? "active" : ""} onClick={() => setAdminTab("users")}>
          {t("tabUsers")}
        </button>
        <button className={adminTab === "analytics" ? "active" : ""} onClick={() => setAdminTab("analytics")}>
          {t("tabAnalytics")}
        </button>
      </div>
      {adminTab === "reports" && <ReportsTab />}
      {adminTab === "users" && <UsersTab />}
      {adminTab === "analytics" && <AnalyticsTab />}
    </>
  );
}

function ReportsTab() {
  const { reports, neighborhoods, adminSetStatus, adminRemoveReport } = useApp();
  const { t } = useTranslation();

  if (reports.length === 0) {
    return (
      <div className="empty">
        <EmptyIcon style={{ width: 38, height: 38, marginBottom: 10, opacity: 0.5 }} />
        <div>{t("emptyReports")}</div>
      </div>
    );
  }

  const sorted = [...reports].sort((a, b) => b.ts - a.ts);

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>{t("colLocation")}</th>
            <th>{t("colType")}</th>
            <th>{t("colConfirms")}</th>
            <th>{t("colStatus")}</th>
            <th>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const n = neighborhoods.find((x) => x.id === r.neighborhoodId);
            return (
              <tr key={r.id}>
                <td>
                  {n?.name}
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{timeAgo(r.ts)} ago</div>
                </td>
                <td>{r.type === "restoration" ? t("typeRestoration") : t("typeOutage")}</td>
                <td className="mono">{r.confirmations}</td>
                <td>
                  <span className="status-pill" style={{ background: statusBadgeBg(r.status), color: statusBadgeFg(r.status) }}>
                    {t(r.status)}
                  </span>
                </td>
                <td className="row-actions">
                  <button className="approve" onClick={() => adminSetStatus(r.id, "verified")}>
                    {t("approve")}
                  </button>
                  <button className="reject" onClick={() => adminSetStatus(r.id, "flagged")}>
                    {t("reject")}
                  </button>
                  <button onClick={() => adminRemoveReport(r.id)}>{t("remove")}</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab() {
  const { users, toggleAdminRole } = useApp();
  const { t } = useTranslation();

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>{t("colUser")}</th>
            <th>{t("colEmail")}</th>
            <th>{t("colRole")}</th>
            <th>{t("colReports")}</th>
            <th>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td className="mono" style={{ fontSize: 12 }}>
                {u.email}
              </td>
              <td>
                <span
                  className="status-pill"
                  style={{
                    background: u.role === "admin" ? "#2E6FEA22" : "var(--surface-2)",
                    color: u.role === "admin" ? "var(--blue)" : "var(--muted)",
                  }}
                >
                  {u.role}
                </span>
              </td>
              <td className="mono">{u.reports}</td>
              <td className="row-actions">
                <button onClick={() => toggleAdminRole(u.id)}>{u.role === "admin" ? t("suspend") : t("makeAdmin")}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsTab() {
  const { neighborhoods, reports } = useApp();
  const { t } = useTranslation();

  const byState = {};
  neighborhoods.forEach((n) => {
    byState[n.state] = byState[n.state] || [];
    byState[n.state].push(n.score);
  });

  return (
    <div className="grid-2">
      <div className="card">
        <h3>
          {t("lightScoreTitle")} — {t("reliability")} {t("trend")}
        </h3>
        {Object.entries(byState).map(([state, scores]) => {
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          return (
            <div key={state} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <b>{state}</b>
                <span className="mono">{avg}</span>
              </div>
              <div style={{ height: 8, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${avg}%`, background: gaugeColorVar(avg) }}></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card">
        <h3>{t("totalReports")}</h3>
        <div className="val" style={{ fontSize: 36, fontFamily: "'Sora',sans-serif", fontWeight: 800 }}>
          {reports.length}
        </div>
        <div className="helper">
          {reports.filter((r) => r.status === "verified").length} {t("verified").toLowerCase()} ·{" "}
          {reports.filter((r) => r.status === "flagged").length} {t("flagged").toLowerCase()}
        </div>
      </div>
    </div>
  );
}
