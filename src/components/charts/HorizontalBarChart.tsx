import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export interface HorizontalBarDataItem {
  name: string;
  score: number;
}

interface HorizontalBarChartProps {
  data?: HorizontalBarDataItem[];
  height?: number;
}

const defaultData: HorizontalBarDataItem[] = [
  { name: "准确性", score: 95.8 },
  { name: "完整性", score: 92.3 },
  { name: "一致性", score: 88.6 },
  { name: "唯一性", score: 97.1 },
  { name: "及时性", score: 84.2 },
  { name: "有效性", score: 90.5 },
  { name: "规范性", score: 86.9 },
];

function getScoreColor(score: number): string {
  if (score >= 95) return "#10B981";
  if (score >= 90) return "#00B4D8";
  if (score >= 85) return "#F4A100";
  return "#EF4444";
}

function getScoreBgColor(score: number): string {
  if (score >= 95) return "rgba(16, 185, 129, 0.12)";
  if (score >= 90) return "rgba(0, 180, 216, 0.12)";
  if (score >= 85) return "rgba(244, 161, 0, 0.12)";
  return "rgba(239, 68, 68, 0.12)";
}

function getLevelLabel(score: number): { label: string; className: string } {
  if (score >= 95) return { label: "优秀", className: "bg-success-50 text-success-700" };
  if (score >= 90) return { label: "良好", className: "bg-cyan-50 text-cyan-700" };
  if (score >= 85) return { label: "合格", className: "bg-gold-50 text-gold-700" };
  return { label: "待改进", className: "bg-danger-50 text-danger-700" };
}

export default function HorizontalBarChart({
  data = defaultData,
  height = 320,
}: HorizontalBarChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
          barSize={20}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
            tickFormatter={(v) => `${v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,180,216,0.05)" }}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15,44,89,0.10)",
              padding: "12px 16px",
            }}
            formatter={(value: number) => [
              `${value.toFixed(1)} 分`,
              "质量分",
            ]}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getScoreColor(entry.score)}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2 px-2">
        {data.map((item, index) => {
          const level = getLevelLabel(item.score);
          return (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getScoreColor(item.score) }}
                />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800 tabular-nums">
                  {item.score.toFixed(1)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${level.className}`}
                >
                  {level.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { getScoreColor, getScoreBgColor, getLevelLabel };
