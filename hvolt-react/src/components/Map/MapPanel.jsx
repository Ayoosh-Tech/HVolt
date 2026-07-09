import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { SearchIcon } from "../../utils/icons.jsx";
import { STATUS_COLOR } from "../../utils/helpers.js";
import NeighborhoodList from "./NeighborhoodList.jsx";

// Debounced OpenStreetMap Nominatim search — same endpoint/behavior as the
// original vanilla-JS demo, just wrapped in a hook so MapPanel stays declarative.
function useLocationSearch(query) {
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ng&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data);
      } catch {
        // Silent fail is acceptable for this demo search box.
      }
    }, 450);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return results;
}

export default function MapPanel({ neighborhoods, onFocusNeighborhood, onFlyToCoord }) {
  const { filterState, setFilterState } = useApp();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const results = useLocationSearch(query);

  const states = ["all", ...new Set(neighborhoods.map((n) => n.state))];

  return (
    <div className="map-panel">
      <div className="search-box">
        <SearchIcon style={{ width: 15, height: 15 }} />
        <input
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      

      {results.length > 0 && (
        <div className="search-results">
          {results.map((r) => (
            <div
              key={r.place_id}
              onClick={() => {
                onFlyToCoord(parseFloat(r.lat), parseFloat(r.lon));
                setQuery("");
              }}
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}
</div>
      <div>
        <label className="helper" style={{ display: "block", marginBottom: 6 }}>
          {t("filterState")}
        </label>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
          {states.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? t("all") : s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="helper" style={{ marginBottom: 8, fontWeight: 700, color: "var(--text)" }}>
          {t("legendTitle")}
        </div>
        <div className="legend">
          <LegendRow color={STATUS_COLOR.available} label={t("available")} />
          <LegendRow color={STATUS_COLOR.outage} label={t("confirmedOutage")} />
          <LegendRow color={STATUS_COLOR.unverified} label={t("unverified")} />
          <LegendRow color={STATUS_COLOR.none} label={t("noReports")} />
        </div>
      </div>

      <div>
        <div className="helper" style={{ marginBottom: 8, fontWeight: 700, color: "var(--text)" }}>
          {t("neighborhoods")}
        </div>
        <NeighborhoodList neighborhoods={neighborhoods} onSelect={onFocusNeighborhood} />
      </div>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="legend-row">
      <span className="dot" style={{ background: color }}></span>
      {label}
    </div>
  );
}
