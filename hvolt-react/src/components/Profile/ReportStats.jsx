import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n";

export default function ReportStats() {
  const { reports, user } = useApp();
  const { t } = useTranslation();

  const myReports = reports.filter(
    (report) => report.reporterId === user?.id
  );
  
  const totalReports = myReports.length;

  const verifiedReports = myReports.filter(
    (report) => report.status === "verified"
  ).length;

  const outageReports = myReports.filter(
    (report) => report.type === "outage"
  ).length;

  const restorationReports = myReports.filter(
    (report) => report.type === "restoration"
  ).length;

  console.log("User ID:", user?.id);
  console.log("My reports:", myReports);
  console.log("Total reports:", totalReports);
 {/* console.log("User:", user);
  console.log("Reports:", reports); */}
  console.log("Logged in user ID:", user?.id);
  reports.forEach((report) => {
    console.log({ reportId: report.reporterId,
        userId: user?.id,
        match: report.reporterId === user?.id,
    report,
     });
  });
  return (
    <div className="profile-card">
      <h3>{t("reportStats")}</h3>

      <div className="stats-grid">
        <div className="stat-box">
          <h2>{totalReports}</h2>
          <p>{t("totalReports")}</p>
        </div>

        <div className="stat-box">
          <h2>{verifiedReports}</h2>
          <p>{t("verifiedReports")}</p>
        </div>

        <div className="stat-box">
          <h2>{outageReports}</h2>
          <p>{t("outageReports")}</p>
        </div>

        <div className="stat-box">
          <h2>{restorationReports}</h2>
          <p>{t("restorationReports")}</p>
        </div>
      </div>
    </div>
  );
}
