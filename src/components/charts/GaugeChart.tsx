import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getLevelLabel, getScoreColor } from "./HorizontalBarChart";

interface GaugeChartProps {
  value?: number;
  height?: number;
}

const GAUGE_SEGMENTS = [
  { start: 0, end: 60, color: "#EF4444" },
  { start: 60, end: 70, color: "#F97316" },
  { start: 70, end: 80, color: "#F4A100" },
  { start: 80, end: 90, color: "#00B4D8" },
  { start: 90, end: 100, color: "#10B981" },
];

export default function GaugeChart({
  value = 87.6,
  height = 280,
}: GaugeChartProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const level = getLevelLabel(clampedValue);
  const needleAngle = -90 + (clampedValue / 100) * 180;

  const segments = GAUGE_SEGMENTS.map((seg) => ({
    name: `${seg.start}-${seg.end}`,
    value: seg.end - seg.start,
    color: seg.color,
  }));

  const emptySeg = { name: "empty", value: 100, color: "transparent" };
  const chartData = [...segments, emptySeg];

  return (
    <div
      style={{ width: "100%", height }}
      className="relative flex flex-col items-center"
    >
      <ResponsiveContainer width="100%" height={height - 40}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="85%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={1}
            strokeWidth={0}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={entry.name === "empty" ? 0 : 0.85}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div
        className="absolute left-1/2"
        style={{
          top: `${((height - 40) * 0.85 - 100)}px`,
          transform: `translateX(-50%) rotate(${needleAngle}deg)`,
          transformOrigin: "bottom center",
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <svg width="16" height="110" viewBox="0 0 16 110">
          <polygon
            points="8,0 12,90 8,105 4,90"
            fill="#0F2C59"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <circle cx="8" cy="95" r="6" fill="#0F2C59" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute left-1/2" style={{ top: `${(height - 40) * 0.85 - 12}px`, transform: "translateX(-50%)" }}>
        <div className="w-6 h-6 rounded-full bg-navy-800 border-4 border-white shadow-lg" />
      </div>

      <div className="flex flex-col items-center mt-2 z-10 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl">
        <p className="text-xs text-slate-500 mb-1">综合质量得分</p>
        <p
          className="text-4xl font-bold tabular-nums"
          style={{ color: getScoreColor(clampedValue) }}
        >
          {clampedValue.toFixed(1)}
          <span className="text-xl">分</span>
        </p>
        <span
          className={`mt-1 text-xs px-3 py-0.5 rounded-full font-medium ${level.className}`}
        >
          {level.label}
        </span>
      </div>

      <div className="w-full flex justify-between px-4 mt-2 text-xs text-slate-400">
        <span>0</span>
        <span>60</span>
        <span>70</span>
        <span>80</span>
        <span>90</span>
        <span>100</span>
      </div>
    </div>
  );
}
