import React, { useRef, useEffect, useState } from 'react';

/**
 * Radial arc gauge — the visual centerpiece of MaxSafe.
 * 270-degree SVG arc with animated fill. All text (label, percentage,
 * status) rendered inside the arc's open center to avoid overlap.
 */
export default function GasGauge({ percentage: rawPercentage, label, sublabel, detail, isDarkMode }) {
  const percentage = Number.isFinite(rawPercentage) ? rawPercentage : 0;
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(start + (end - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    prevPercent.current = end;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [percentage]);

  // SVG arc parameters — 270-degree arc
  const size = 140;
  const strokeWidth = 9;
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;

  // 270 degrees, starting from bottom-left
  const startAngle = 135;
  const sweepAngle = 270;
  const circumference = (sweepAngle / 360) * 2 * Math.PI * radius;

  // Normalize fill to 150% visual max
  const fillPercent = Math.min(percentage / 150, 1);
  const offset = circumference * (1 - (percentage > 0 ? fillPercent : 0));

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const startPt = polarToCartesian(center, center, radius, startAngle);
  const endPt = polarToCartesian(center, center, radius, startAngle + sweepAngle);
  const arcPath = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 1 1 ${endPt.x} ${endPt.y}`;

  // Tick marks
  const tick = (angle, inner, outer) => {
    const a = startAngle + sweepAngle * (angle / 150);
    const p1 = polarToCartesian(center, center, radius - inner, a);
    const p2 = polarToCartesian(center, center, radius + outer, a);
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  };

  const tick80 = tick(80, strokeWidth / 2 + 1, strokeWidth / 2 + 1);
  const tick100 = tick(100, strokeWidth / 2 + 2, strokeWidth / 2 + 2);

  // Colors
  const getColor = () => {
    if (isOverLimit) return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)', text: 'text-red-500' };
    if (isWarning) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-500' };
    return { stroke: '#10b981', glow: 'rgba(16,185,129,0.2)', text: 'text-emerald-500' };
  };
  const color = getColor();
  const statusText = isOverLimit ? 'OVER LIMIT' : isWarning ? 'CAUTION' : 'SAFE';

  return (
    <div className={`rounded-2xl px-3 pt-3 pb-2 border transition-colors relative overflow-hidden ${
      isOverLimit
        ? isDarkMode ? 'bg-red-500/5 border-red-500/30' : 'bg-red-50 border-red-200'
        : isWarning
        ? isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
        : isDarkMode ? 'bg-or-dark-800/80 border-slate-700/50' : 'bg-white border-slate-200'
    }`}>
      {/* Glow behind gauge when danger */}
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
        {/* Gauge container — SVG + overlaid text, all inside the arc */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
          >
            {/* Track */}
            <path
              d={arcPath}
              fill="none"
              stroke={isDarkMode ? '#1a1a25' : '#e2e8f0'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* 80% tick */}
            <line {...tick80}
              stroke={isDarkMode ? '#334155' : '#94a3b8'}
              strokeWidth={1.5} opacity={0.5}
            />
            {/* 100% tick */}
            <line {...tick100}
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
                  ? `drop-shadow(0 0 6px ${color.glow})`
                  : isWarning
                  ? `drop-shadow(0 0 3px ${color.glow})`
                  : 'none',
              }}
            />
          </svg>

          {/* All text inside the arc — label on top, number in center, status below */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '8%', paddingBottom: '16%' }}>
            <p className={`text-[10px] font-semibold font-display tracking-wide uppercase ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {label}
            </p>
            <span className={`font-mono text-3xl font-bold tracking-tight leading-none mt-1 ${color.text}`}>
              {displayNum.toFixed(1)}
              <span className="text-base">%</span>
            </span>
            <span className={`text-[9px] font-bold tracking-widest uppercase mt-1 ${
              isOverLimit ? 'text-red-400' : isWarning ? 'text-amber-400' : isDarkMode ? 'text-emerald-400/60' : 'text-emerald-600/60'
            }`}>
              {statusText}
            </span>
            {sublabel && (
              <span className={`text-[8px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {sublabel}
              </span>
            )}
          </div>
        </div>

        {/* Only compact detail below the arc — fits in the bottom gap */}
        {(sublabel || detail) && (
          <div className="text-center -mt-5">
            {detail && (
              <p className={`text-[10px] font-mono font-medium ${color.text}`}>
                {detail}
              </p>
            )}
            {!detail && sublabel && (
              <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {sublabel}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
