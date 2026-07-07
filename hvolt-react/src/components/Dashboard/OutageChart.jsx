import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { useTranslation } from "../../i18n/index.js";

// Same fixed demo dataset as the original vanilla-JS version — in production
// this would be fed from the reports API grouped by day.
const DEMO_DATA = [4, 7, 5, 9, 6, 10, 3];

export default function OutageChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    const days = lang === "ha" ? ["Lah", "Lit", "Tal", "Lar", "Alh", "Jum", "Asa"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: days,
        datasets: [{ label: t("activeOutages"), data: DEMO_DATA, backgroundColor: "#E8483A", borderRadius: 6 }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(150,160,155,.15)" } },
          x: { grid: { display: false } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [lang, t]);

  return <canvas ref={canvasRef} height="150"></canvas>;
}
