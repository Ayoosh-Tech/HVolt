import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";

export default function AchievementBadges() {
  const { reports, user } = useApp();
  const { t } = useTranslation();

  const myReports = reports.filter(
    (report) => report.reporterId === user?.id
  );

  const badges = [];

  if (myReports.length >= 1) {
    badges.push({
      icon: "🥇",
      title: t("firstReport"),
      description: t("firstReportDesc"),
    });
  }

  if (myReports.length >= 5) {
    badges.push({
      icon: "⚡",
      title: t("communityHelper"),
      description: t("communityHelperDesc"),
    });
  }

  if (myReports.length >= 10) {
    badges.push({
      icon: "🏆",
      title: t("powerChampion"),
      description: t("powerChampionDesc"),
    });
  }

  return (
    <div className="profile-card">
      <h3>{t("achievementBadges")}</h3>

      {badges.length === 0 ? (
        <p>{t("noBadgesYet")}</p>
      ) : (
        <div className="badges-grid">
          {badges.map((badge) => (
            <div className="badge-card" key={badge.title}>
              <div className="badge-icon">{badge.icon}</div>
              <h4>{badge.title}</h4>
              <p>{badge.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
