import { gaugeColorVar } from "../../utils/helpers.js";

// Renders a 270° arc gauge for a neighborhood's Light Score (0-100).
// Pure presentational component — no state, easy to reuse anywhere a score
// needs to be shown (dashboard cards today, neighborhood detail views later).
export default function LightScoreGauge({ score, size = 110 }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = c * 0.75; // 270-degree arc
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = dash * (1 - pct);
  const color = gaugeColorVar(score);

  return (
    <svg width={size} height={size * (100 / 110)} viewBox="0 0 110 100">
      <g transform="rotate(135 55 55)">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="9" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9" strokeDasharray={`${dash} ${c}`} strokeDashoffset={offset} strokeLinecap="round" />
      </g>
      <text x="55" y="60" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="22" fill="var(--text)">
        {score}
      </text>
    </svg>
  );
}
