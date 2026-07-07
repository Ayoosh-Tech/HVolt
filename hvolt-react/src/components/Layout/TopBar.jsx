import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { SunIcon, MoonIcon } from "../../utils/icons.jsx";
import { initials } from "../../utils/helpers.js";
import Logo from "./Logo.jsx";

// The logo lives here (in addition to the sidebar) so the HVolt brand is
// always visible at the top of the screen — including on mobile, where the
// sidebar is hidden in favor of the bottom nav.
export default function TopBar() {
  const { lang, setLang, theme, toggleTheme, user, setAuthModal } = useApp();
  const { t } = useTranslation();

  return (
    <div className="topbar">
      <Logo compact />
      <div className="topbar-spacer" />
      <div className="lang-toggle">
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
          EN
        </button>
        <button className={lang === "ha" ? "active" : ""} onClick={() => setLang("ha")}>
          HA
        </button>
      </div>
      <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <SunIcon style={{ width: 17, height: 17 }} /> : <MoonIcon style={{ width: 17, height: 17 }} />}
      </button>
      {user ? (
        <div className="avatar" title={user.name}>
          {initials(user.name)}
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => setAuthModal("login")}>
          {t("login")}
        </button>
      )}
    </div>
  );
}
