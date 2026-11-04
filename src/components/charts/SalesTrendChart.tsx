import React, { useState } from 'react';
import { SalesTransaction } from '../../types';
import { aggregateSalesTimeline, formatCurrency } from '../../utils/calculations';

interface SalesTrendChartProps {
  sales: SalesTransaction[];
  currency: string;
  days?: number;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ sales, currency, days = 14 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = aggregateSalesTimeline(sales, days);

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const maxUnits = Math.max(...data.map(d => d.units), 10);

  // Chart coordinates
  const height = 180;
  const paddingX = 30;
  const paddingY = 20;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (500 - paddingX * 2);
    const y = height - paddingY - (d.revenue / maxRevenue) * usableHeight;
    return { ...d, x, y };
  });

  // Generate SVG path for smooth line
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  // Fill area under line
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Daily Revenue & Fulfillment ({days}-Day Rolling History)
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
            Units Sold
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 500 ${height}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={500 - paddingX}
            y2={paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={500 - paddingX}
            y2={height / 2}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={500 - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Bar background for Units Sold */}
          {points.map((p, i) => {
            const barHeight = (p.units / maxUnits) * (usableHeight * 0.7);
            const barWidth = 14;
            return (
              <rect
                key={i}
                x={p.x - barWidth / 2}
                y={height - paddingY - barHeight}
                width={barWidth}
                height={barHeight}
                className="fill-slate-200 dark:fill-slate-800/80 transition-all hover:fill-slate-300 dark:hover:fill-slate-700"
                rx="2"
              />
            );
          })}

          {/* Filled Area */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Revenue Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 5 : 3.5}
              className={`cursor-pointer transition-all ${
                hoveredIndex === i ? 'fill-indigo-600 stroke-4 stroke-white dark:stroke-slate-900' : 'fill-white stroke-2 stroke-indigo-600 dark:fill-slate-900'
              }`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Dynamic Tooltip on hover */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute top-2 pointer-events-none p-2 bg-slate-900 text-white rounded-lg shadow-lg text-[11px] font-mono border border-slate-700"
            style={{
              left: `${(points[hoveredIndex].x / 500) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-sans font-semibold text-slate-300">{points[hoveredIndex].displayDate}</div>
            <div className="text-indigo-400 font-bold">{formatCurrency(points[hoveredIndex].revenue, currency)}</div>
            <div className="text-slate-400">{points[hoveredIndex].units} units sold</div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-6 mt-1 text-[10px] font-mono text-slate-400">
        <span>{data[0]?.displayDate}</span>
        <span>{data[Math.floor(data.length / 2)]?.displayDate}</span>
        <span>{data[data.length - 1]?.displayDate}</span>
      </div>
    </div>
  );
};
