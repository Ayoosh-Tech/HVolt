import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useTranslation } from "../../i18n/index.js";

export default function ReportForm() {
  console.log("ReportForm rendered");
  const { neighborhoods, reportType, setReportType, submitReport, toast } = useApp();
  const { t } = useTranslation();
  const [neighborhoodId, setNeighborhoodId] = useState(neighborhoods[0]?.id);
  const commentRef = useRef(null);

  // Neighborhoods load asynchronously from the API, so the list may still be
  // empty on first render. Default to the first one as soon as it arrives,
  // without clobbering a choice the person has already made.
  useEffect(() => {
    if (!neighborhoodId && neighborhoods.length > 0) {
      setNeighborhoodId(neighborhoods[0].id);
    }
  }, [neighborhoods, neighborhoodId]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast("GPS unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => toast("Location captured"),
      () => toast("Location permission denied")
    );
  }

  async function handleSubmit() {
    console.log("Neighborhoods:", neighborhoods);
    console.log("Length:", neighborhoods.length);
    console.log("Selected ID:", neighborhoodId);

    const comment = commentRef.current.value;
    const ok = await submitReport(neighborhoodId, comment);
    if (ok && commentRef.current) commentRef.current.value = "";
  }

  console.log("Neighborhoods:", neighborhoods);
  console.log("First neighborhood:", neighborhoods[0]);
  console.log("Selected ID:", neighborhoodId);

  return (
    <>
      <h1>{t("reportHeading")}</h1>
      <p className="lede">{t("reportLede")}</p>
      <div className="form-card">
        <div className="seg" style={{ marginBottom: 16 }}>
          <button className={reportType === "outage" ? "active" : ""} onClick={() => setReportType("outage")}>
            {t("typeOutage")}
          </button>
          <button className={reportType === "restoration" ? "active" : ""} onClick={() => setReportType("restoration")}>
            {t("typeRestoration")}
          </button>
        </div>

        <div className="field">
          <label>{t("location")}</label>
          <select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)}>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}, {n.state}
              </option>
            ))}
          </select>
          <div className="helper">
            {t("useCurrent")} —{" "}
            <button className="link-btn" onClick={useCurrentLocation}>
              GPS
            </button>
          </div>
        </div>

        <div className="field">
          <label>{t("comment")}</label>
          <textarea ref={commentRef} placeholder={t("commentPh")}></textarea>
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit}>
          {t("submit")}
        </button>
      </div>
    </>
  );
}
