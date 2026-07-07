import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { isLatestReport, reliabilityLabel, timeAgo } from "../../utils/helpers.js";
import LightScoreGauge from "./LightScoreGauge.jsx";
import OutageChart from "./OutageChart.jsx";

export default function Dashboard() {
  const { reports, neighborhoods } = useApp();
  const { t } = useTranslation();

  const active = reports.filter((r) => r.type === "outage" && r.status !== "flagged" && isLatestReport(reports, r)).length;
  const restored = reports.filter((r) => r.type === "restoration" && isLatestReport(reports, r)).length;
  const total = reports.length;
  const verified = reports.filter((r) => r.status === "verified").length;

  const topScores = [...neighborhoods].sort((a, b) => b.score - a.score).slice(0, 4);
  const recent = [...reports].sort((a, b) => b.ts - a.ts).slice(0, 6);

  return (
    <>
      <h1>{t("dashHeading")}</h1>
      <p className="lede">{t("dashLede")}</p>

      <div className="stat-grid">
        <StatCard label={t("activeOutages")} value={active} color="var(--red)" tagBg="#E8483A22" tagColor="var(--red)" tag={t("thisWeek")} />
        <StatCard label={t("recentlyRestored")} value={restored} color="var(--green)" tagBg="#1FA46322" tagColor="var(--green)" tag={t("thisWeek")} />
        <StatCard label={t("totalReports")} value={total} tagBg="var(--surface-2)" tagColor="var(--muted)" tag={t("thisWeek")} />
        <StatCard label={t("verifiedReports")} value={verified} color="var(--blue)" tagBg="#2E6FEA22" tagColor="var(--blue)" tag={t("thisWeek")} />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>{t("chartTitle")}</h3>
          <OutageChart />
        </div>
        <div className="card">
          <h3>{t("activityTitle")}</h3>
          {recent.map((r) => {
            const n = neighborhoods.find((x) => x.id === r.neighborhoodId);
            const color = r.type === "restoration" ? "var(--green)" : r.status === "verified" ? "var(--red)" : "var(--amber)";
            const label = r.type === "restoration" ? t("restored") : t(r.status === "verified" ? "confirmedOutage" : "unverified");
            return (
              <div className="activity-row" key={r.id}>
                <span className="activity-dot" style={{ background: color }}></span>
                <div>
                  <b>{n?.name}</b> — {label}
                  <div style={{ color: "var(--muted)", marginTop: 2 }}>
                    {timeAgo(r.ts)} · {r.confirmations} {t("confirmationsN")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h3 style={{ margin: "6px 0 12px" }}>{t("lightScoreTitle")}</h3>
      <div className="gauge-grid">
        {topScores.map((n) => (
          <div className="gauge-card" key={n.id}>
            <LightScoreGauge score={n.score} />
            <div className="gname">{n.name}</div>
            <div className="glevel">{reliabilityLabel(n.score, t)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatCard({ label, value, color, tagBg, tagColor, tag }) {
  return (
    <div className="stat-card">
      <div className="lbl">{label}</div>
      <div className="val" style={color ? { color } : undefined}>
        {value}
      </div>
      <span className="tag" style={{ background: tagBg, color: tagColor }}>
        {tag}
      </span>
    </div>
  );
}
