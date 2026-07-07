import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";
import MapPanel from "./MapPanel.jsx";
import MapView from "./MapView.jsx";

export default function MapPage() {
  const { neighborhoods, filterState } = useApp();
  const { t } = useTranslation();
  const [flyTarget, setFlyTarget] = useState(null);
  const [popupTargetId, setPopupTargetId] = useState(null);

  const filtered = neighborhoods.filter((n) => filterState === "all" || n.state === filterState);

  function focusNeighborhood(neighborhood) {
    setFlyTarget({ lat: neighborhood.lat, lng: neighborhood.lng, zoom: 13 });
    setPopupTargetId(neighborhood.id);
  }

  function flyToCoord(lat, lng) {
    setFlyTarget({ lat, lng, zoom: 13 });
    setPopupTargetId(null);
  }

  return (
    <>
      <h1>{t("mapHeading")}</h1>
      <p className="lede">{t("mapLede")}</p>
      <div className="map-layout">
        <MapPanel neighborhoods={filtered} onFocusNeighborhood={focusNeighborhood} onFlyToCoord={flyToCoord} />
        <div id="map">
          <MapView neighborhoods={filtered} flyTarget={flyTarget} popupTargetId={popupTargetId} />
        </div>
      </div>
    </>
  );
}
