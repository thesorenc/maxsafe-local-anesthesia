import React, { useRef, useEffect, useState } from 'react';

/**
 * Radial arc gauge — the visual centerpiece of MaxSafe.
 * 270-degree SVG arc with animated fill, centered percentage readout,
 * and color-coded glow at danger thresholds.
 */
export default function GasGauge({ percentage: rawPercentage, label, sublabel, detail, isDarkMode }) {
  const percentage = Number.isFinite(rawPercentage) ? rawPercentage : 0;
  const clampedPercent = Math.min(percentage, 150); // Visual cap at 150% for the arc
  const isOverLimit = percentage > 100;
  const isWarning = percentage > 80 && percentage <= 100;

  // Animate the displayed number
  const [displayNum, setDisplayNum] = useState(0);
  const prevPercent = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevPercent.current;
    const end = percentage;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(start + (end - start) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    prevPercent.current = end;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [percentage]);

  // SVG arc parameters — 270-degree arc
  const size = 160;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;

  // 270 degrees in radians, starting from bottom-left
  const startAngle = 135; // degrees from 12 o'clock
  const sweepAngle = 270;
  const circumference = (sweepAngle / 360) * 2 * Math.PI * radius;
  const fillPercent = Math.min(clampedPercent / 150, 1); // Normalize to 150% max
  const offset = circumference * (1 - (percentage > 0 ? fillPercent : 0));

  // Arc path
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const startPt = polarToCartesian(center, center, radius, startAngle);
  const endPt = polarToCartesian(center, center, radius, startAngle + sweepAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  const arcPath = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPt.x} ${endPt.y}`;

  // Warning tick mark at 80%
  const tickAngle80 = startAngle + sweepAngle * (80 / 150);
  const tick80Inner = polarToCartesian(center, center, radius - strokeWidth / 2 - 2, tickAngle80);
  const tick80Outer = polarToCartesian(center, center, radius + strokeWidth / 2 + 2, tickAngle80);

  // 100% tick mark
  const tickAngle100 = startAngle + sweepAngle * (100 / 150);
  const tick100Inner = polarToCartesian(center, center, radius - strokeWidth / 2 - 2, tickAngle100);
  const tick100Outer = polarToCartesian(center, center, radius + strokeWidth / 2 + 2, tickAngle100);

  // Color determination
  const getColor = () => {
    if (isOverLimit) return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)', text: 'text-red-500' };
    if (isWarning) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-500' };
    return { stroke: '#10b981', glow: 'rgba(16,185,129,0.2)', text: 'text-emerald-500' };
  };

  const color = getColor();

  // Status label
  const statusText = isOverLimit ? 'OVER LIMIT' : isWarning ? 'CAUTION' : 'SAFE';

  return (
    <div className={`rounded-2xl p-4 border transition-colors relative overflow-hidden ${
      isOverLimit
        ? isDarkMode ? 'bg-red-500/5 border-red-500/30' : 'bg-red-50 border-red-200'
        : isWarning
        ? isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
        : isDarkMode ? 'bg-or-dark-800/80 border-slate-700/50' : 'bg-white border-slate-200'
    }`}>
      {/* Glow effect behind gauge when danger */}
      {(isOverLimit || isWarning) && (
        <div
          className="absolute inset-0 pointer-events-none gauge-glow"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${color.glow}, transparent 70%)`,
            opacity: isOverLimit ? 0.6 : 0.3,
          }}
        />
      )}

      <div className="relative flex flex-col items-center">
        {/* SVG Gauge */}
        <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.85}`} className="overflow-visible">
          {/* Track (background arc) */}
          <path
            d={arcPath}
            fill="none"
            stroke={isDarkMode ? '#1a1a25' : '#e2e8f0'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* 80% tick mark */}
          <line
            x1={tick80Inner.x} y1={tick80Inner.y}
            x2={tick80Outer.x} y2={tick80Outer.y}
            stroke={isDarkMode ? '#334155' : '#94a3b8'}
            strokeWidth={1.5}
            opacity={0.6}
          />

          {/* 100% tick mark */}
          <line
            x1={tick100Inner.x} y1={tick100Inner.y}
            x2={tick100Outer.x} y2={tick100Outer.y}
            stroke={isDarkMode ? '#475569' : '#64748b'}
            strokeWidth={2}
          />

          {/* Fill arc */}
          <path
            d={arcPath}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-track"
            style={{
              filter: isOverLimit
                ? `drop-shadow(0 0 8px ${color.glow})`
                : isWarning
                ? `drop-shadow(0 0 4px ${color.glow})`
                : 'none',
            }}
          />
        </svg>

        {/* Centered readout — overlaid on the gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: '12%' }}>
          <span className={`font-mono text-3xl font-bold tracking-tight ${color.text}`}>
            {displayNum.toFixed(1)}
            <span className="text-lg">%</span>
          </span>
          <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${
            isOverLimit ? 'text-red-400' : isWarning ? 'text-amber-400' : isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'
          }`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center mt-1">
        <p className={`text-sm font-semibold font-display ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          {label}
        </p>
        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {sublabel}
        </p>
        {detail && (
          <p className={`text-xs font-mono font-medium mt-0.5 ${color.text}`}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
