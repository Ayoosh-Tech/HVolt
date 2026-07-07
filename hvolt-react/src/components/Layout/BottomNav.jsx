import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { MapIcon, GridIcon, BoltIcon, ShieldIcon, UserIcon } from "../../utils/icons.jsx";

const iconSize = { width: 20, height: 20 };

export default function BottomNav() {
  const { view, setView, user, setAuthModal } = useApp();
  const { t } = useTranslation();
  const isAdmin = user?.role === "admin";

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Item active={view === "map"} onClick={() => setView("map")} icon={<MapIcon style={iconSize} />} label={t("map")} />
        <Item active={view === "dashboard"} onClick={() => setView("dashboard")} icon={<GridIcon style={iconSize} />} label={t("dashboard")} />
        <Item active={view === "report"} onClick={() => setView("report")} icon={<BoltIcon style={iconSize} />} label={t("report")} />
        {isAdmin ? (
          <Item active={view === "admin"} onClick={() => setView("admin")} icon={<ShieldIcon style={iconSize} />} label={t("admin")} />
        ) : user ? (
          <Item active={view === "profile"} onClick={() => setView("profile")} icon={<UserIcon style={iconSize} />} label={t("profile")} />
          ) : ( <Item active={false} onClick={() => { if 
            (user) {
              setView("profile");
            } else {
              setAuthModal("login");
            }
          }} icon={<UserIcon style={iconSize} />} label={user ? t("profile") : t("login")} />
        )}
      </div>
    </nav>
  );
}

function Item({ active, onClick, icon, label }) {
  return (
    <button className={`bn-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
