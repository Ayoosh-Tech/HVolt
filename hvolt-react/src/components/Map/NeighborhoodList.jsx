import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { neighborhoodStatus, STATUS_COLOR, STATUS_LABEL_KEY } from "../../utils/helpers.js";

export default function NeighborhoodList({ neighborhoods, onSelect }) {
  const { reports } = useApp();
  const { t } = useTranslation();

  return (
    <div className="neigh-list">
      {neighborhoods.map((n) => {
        const status = neighborhoodStatus(reports, n.id);
        return (
          <div className="neigh-card" key={n.id} onClick={() => onSelect(n)}>
            <div className="top">
              <span className="name">{n.name}</span>
              <span
                className="status-pill"
                style={{ background: `${STATUS_COLOR[status]}22`, color: STATUS_COLOR[status] }}
              >
                {t(STATUS_LABEL_KEY[status])}
              </span>
            </div>
            <div className="loc">
              {n.lga}, {n.state}
            </div>
          </div>
        );
      })}
    </div>
  );
}
