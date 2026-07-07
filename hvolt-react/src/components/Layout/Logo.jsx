import { BoltIcon } from "../../utils/icons.jsx";
import { useTranslation } from "../../i18n/index.js";

// Single source of truth for the HVolt logo. `compact` drops the tagline for
// tight spaces (e.g. the mobile top bar).
export default function Logo({ compact = false }) {
  const { t } = useTranslation();
  return (
    <div className="brand">
      <div className="brand-mark">
        <BoltIcon style={{ width: 18, height: 18, color: "#12181A" }} />
      </div>
      <div>
        <div className="brand-name">{t("appTitle")}</div>
        {!compact && <div className="brand-sub">{t("appSub")}</div>}
      </div>
    </div>
  );
}
