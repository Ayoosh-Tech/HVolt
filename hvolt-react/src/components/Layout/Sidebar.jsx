import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { MapIcon, GridIcon, BoltIcon, ShieldIcon, UserIcon } from "../../utils/icons.jsx";
import Logo from "./Logo.jsx";

const iconSize = { width: 19, height: 19 };

export default function Sidebar() {
  const { view, setView, user, logout, setAuthModal } = useApp();
  const { t } = useTranslation();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="sidebar">
      <Logo />

      <NavItem active={view === "map"} onClick={() => setView("map")} icon={<MapIcon style={iconSize} />} label={t("map")} />
      <NavItem active={view === "dashboard"} onClick={() => setView("dashboard")} icon={<GridIcon style={iconSize} />} label={t("dashboard")} />
      <NavItem active={view === "report"} onClick={() => setView("report")} icon={<BoltIcon style={iconSize} />} label={t("report")} />
      <NavItem active={view === "profile"} onClick={() => setView("profile")} icon={<UserIcon style={iconSize} />} label={t("profile")} />
      {isAdmin && (
        <NavItem active={view === "admin"} onClick={() => setView("admin")} icon={<ShieldIcon style={iconSize} />} label={t("admin")} />
      )}

      <div className="sidebar-foot">
        {user ? (
          <NavItem active={false} onClick={logout} icon={<UserIcon style={iconSize} />} label={t("logout")} />
        ) : (
          <button className="nav-item active" onClick={() => setAuthModal("login")}>
            <UserIcon style={iconSize} />
            <span>{t("login")}</span>
          </button>
        )}
      </div>
    </aside>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
