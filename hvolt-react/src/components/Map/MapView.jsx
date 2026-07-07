import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import { neighborhoodStatus, STATUS_COLOR, STATUS_LABEL_KEY, timeAgo } from "../../utils/helpers.js";

const NIGERIA_CENTER = [9.5, 7.5];
const DEFAULT_ZOOM = 6;
const FOCUS_ZOOM = 13;

// Imperative helper: whenever `flyTarget` changes, pan/zoom the underlying
// Leaflet map instance. Lives inside <MapContainer> so it can call useMap().
function FlyToController({ flyTarget }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.setView([flyTarget.lat, flyTarget.lng], flyTarget.zoom ?? FOCUS_ZOOM, { animate: true });
    }
  }, [flyTarget, map]);
  return null;
}

export default function MapView({ neighborhoods, flyTarget, popupTargetId }) {
  const { reports } = useApp();
  const { t } = useTranslation();
  const markerRefs = useRef({});

  // Open the matching marker's popup whenever the user picks a neighborhood
  // from the side-panel list (rather than clicking the marker directly).
  useEffect(() => {
    if (popupTargetId && markerRefs.current[popupTargetId]) {
      markerRefs.current[popupTargetId].openPopup();
    }
  }, [popupTargetId]);

  const markers = useMemo(() => {
    return neighborhoods.map((n) => {
      const status = neighborhoodStatus(reports, n.id);
      const reps = reports.filter((r) => r.neighborhoodId === n.id).sort((a, b) => b.ts - a.ts);
      const latest = reps[0];
      return { neighborhood: n, status, latest };
    });
  }, [neighborhoods, reports]);

  return (
    <MapContainer center={NIGERIA_CENTER} zoom={DEFAULT_ZOOM} zoomControl style={{ width: "100%", height: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        maxZoom={19}
      />
      <FlyToController flyTarget={flyTarget} />
      {markers.map(({ neighborhood, status, latest }) => (
        <CircleMarker
          key={neighborhood.id}
          ref={(el) => {
            if (el) markerRefs.current[neighborhood.id] = el;
          }}
          center={[neighborhood.lat, neighborhood.lng]}
          radius={11}
          pathOptions={{ color: "#fff", weight: 2, fillColor: STATUS_COLOR[status], fillOpacity: 0.95 }}
        >
          <Popup>
            <MarkerPopup neighborhood={neighborhood} status={status} latest={latest} t={t} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function MarkerPopup({ neighborhood, status, latest, t }) {
  const { confirmReport, flagReport } = useApp();
  return (
    <div style={{ fontFamily: "Inter, sans-serif", minWidth: 180 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>{neighborhood.name}</div>
      <div style={{ fontSize: 11, color: "#5B6B63", marginBottom: 6 }}>
        {neighborhood.lga}, {neighborhood.state}
      </div>
      <div
        style={{
          display: "inline-block",
          fontSize: 10.5,
          fontWeight: 800,
          padding: "2px 8px",
          borderRadius: 20,
          background: `${STATUS_COLOR[status]}22`,
          color: STATUS_COLOR[status],
          marginBottom: 8,
        }}
      >
        {t(STATUS_LABEL_KEY[status])}
      </div>
      {latest && (
        <div style={{ fontSize: 11.5, color: "#5B6B63", marginBottom: 8 }}>
          {latest.confirmations} {t("confirmationsN")} · {timeAgo(latest.ts)}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => confirmReport(neighborhood.id)}
          style={popupBtnStyle}
        >
          {t("confirm")}
        </button>
        <button
          onClick={() => flagReport(neighborhood.id)}
          style={popupBtnStyle}
        >
          {t("flagFalse")}
        </button>
      </div>
    </div>
  );
}

const popupBtnStyle = {
  flex: 1,
  padding: 6,
  borderRadius: 8,
  border: "1px solid #E1E9E3",
  background: "#F6F9F6",
  fontWeight: 700,
  fontSize: 10.5,
  cursor: "pointer",
};
