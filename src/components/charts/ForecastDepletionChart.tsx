import React, { useState } from 'react';
import { Product } from '../../types';

interface ForecastDepletionChartProps {
  product: Product;
  horizonDays?: number;
  demandMultiplier?: number;
}

export const ForecastDepletionChart: React.FC<ForecastDepletionChartProps> = ({
  product,
  horizonDays = 30,
  demandMultiplier = 1.0
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const effectiveDailyDemand = (product.dailyDemand || 2) * demandMultiplier;
  const initialStock = product.currentStock;
  const reorderPoint = product.reorderPoint;
  const minStock = product.minStock;

  // Generate points
  const points: Array<{ day: number; stock: number; dateStr: string }> = [];
  const today = new Date();

  for (let d = 0; d <= horizonDays; d++) {
    const projectedStock = Math.max(0, Math.round(initialStock - effectiveDailyDemand * d));
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + d);
    const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    points.push({ day: d, stock: projectedStock, dateStr });
  }

  const maxVal = Math.max(initialStock * 1.15, reorderPoint * 1.3, 50);

  const height = 190;
  const paddingX = 40;
  const paddingY = 20;
  const usableHeight = height - paddingY * 2;

  const getX = (day: number) => paddingX + (day / horizonDays) * (500 - paddingX * 2);
  const getY = (val: number) => height - paddingY - (val / maxVal) * usableHeight;

  // Path for stock depletion
  const pathD = points.reduce((acc, p, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.stock)}`;
  }, '');

  // Reorder point line Y
  const reorderY = getY(reorderPoint);
  const minStockY = getY(minStock);

  // Find day when stock reaches 0
  const stockoutPoint = points.find(p => p.stock === 0);
  const breachReorderPoint = points.find(p => p.stock <= reorderPoint);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between text-xs mb-2">
        <div className="text-slate-500 dark:text-slate-400">
          Projected Depletion Curve (Burn Rate: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{effectiveDailyDemand.toFixed(1)} u/day</span>)
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <span className="w-2.5 h-0.5 bg-indigo-600 inline-block" />
            Projected Stock
          </span>
          <span className="flex items-center gap-1 text-orange-500">
            <span className="w-2.5 h-0.5 border-t border-dashed border-orange-500 inline-block" />
            Reorder Point ({reorderPoint})
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <span className="w-2.5 h-0.5 border-t border-dashed border-rose-500 inline-block" />
            Safety Min ({minStock})
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 500 ${height}`}
          className="w-full h-48 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Baseline Grid */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={500 - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Reorder Point Threshold Line */}
          {reorderY >= paddingY && reorderY <= height - paddingY && (
            <g>
              <line
                x1={paddingX}
                y1={reorderY}
                x2={500 - paddingX}
                y2={reorderY}
                stroke="#f97316"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />
              <text
                x={paddingX + 4}
                y={reorderY - 4}
                fill="#f97316"
                fontSize="9"
                fontFamily="monospace"
              >
                Reorder Threshold ({reorderPoint})
              </text>
            </g>
          )}

          {/* Safety Stock Min Line */}
          {minStockY >= paddingY && minStockY <= height - paddingY && (
            <g>
              <line
                x1={paddingX}
                y1={minStockY}
                x2={500 - paddingX}
                y2={minStockY}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={500 - paddingX - 90}
                y={minStockY - 4}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="monospace"
              >
                Safety Buffer ({minStock})
              </text>
            </g>
          )}

          {/* Area under depletion line */}
          <path
            d={`${pathD} L ${getX(points[points.length - 1].day)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`}
            className="fill-indigo-500/10 dark:fill-indigo-500/20"
          />

          {/* Depletion curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Points */}
          {points
            .filter((_, i) => i % Math.max(1, Math.floor(horizonDays / 10)) === 0 || i === horizonDays)
            .map(p => (
              <circle
                key={p.day}
                cx={getX(p.day)}
                cy={getY(p.stock)}
                r={hoveredDay === p.day ? 5 : 3.5}
                className="fill-white stroke-2 stroke-indigo-600 dark:fill-slate-900 cursor-pointer"
                onMouseEnter={() => setHoveredDay(p.day)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredDay !== null && (
          <div
            className="absolute top-2 pointer-events-none p-2 bg-slate-900 text-white rounded-lg shadow-lg text-[11px] font-mono border border-slate-700"
            style={{
              left: `${(getX(hoveredDay) / 500) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div>Day +{hoveredDay} ({points[hoveredDay]?.dateStr})</div>
            <div className="text-indigo-400 font-bold">
              Projected: {points[hoveredDay]?.stock} units
            </div>
            {points[hoveredDay]?.stock === 0 && (
              <div className="text-rose-400 font-bold">Stockout Occurs</div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between px-6 mt-1 text-[10px] font-mono text-slate-400">
        <span>Today (Stock: {initialStock})</span>
        {breachReorderPoint && (
          <span className="text-orange-600 dark:text-orange-400">
            Reorder Trigger: Day +{breachReorderPoint.day}
          </span>
        )}
        {stockoutPoint ? (
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            Stockout: Day +{stockoutPoint.day} ({stockoutPoint.dateStr})
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400">
            Sufficient for {horizonDays}+ Days
          </span>
        )}
      </div>
    </div>
  );
};
