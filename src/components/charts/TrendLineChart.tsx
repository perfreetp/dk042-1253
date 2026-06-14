import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

export interface TrendDataItem {
  date: string;
  discovered: number;
  resolved: number;
}

interface TrendLineChartProps {
  data?: TrendDataItem[];
  height?: number;
}

const defaultData: TrendDataItem[] = [
  { date: "01-06", discovered: 142, resolved: 98 },
  { date: "01-07", discovered: 168, resolved: 124 },
  { date: "01-08", discovered: 185, resolved: 156 },
  { date: "01-09", discovered: 210, resolved: 178 },
  { date: "01-10", discovered: 176, resolved: 192 },
  { date: "01-11", discovered: 154, resolved: 148 },
  { date: "01-12", discovered: 198, resolved: 176 },
  { date: "01-13", discovered: 232, resolved: 204 },
  { date: "01-14", discovered: 188, resolved: 196 },
  { date: "01-15", discovered: 165, resolved: 158 },
  { date: "01-16", discovered: 201, resolved: 182 },
  { date: "01-17", discovered: 224, resolved: 210 },
  { date: "01-18", discovered: 178, resolved: 184 },
  { date: "01-19", discovered: 145, resolved: 162 },
];

export default function TrendLineChart({
  data = defaultData,
  height = 320,
}: TrendLineChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="discoveredGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00B4D8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15,44,89,0.10)",
              padding: "12px 16px",
            }}
            labelStyle={{
              color: "#0F172A",
              fontWeight: 600,
              marginBottom: 8,
            }}
            itemStyle={{ padding: "4px 0" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: 8 }}
            formatter={(value) => (
              <span className="text-sm text-slate-600">
                {value === "discovered" ? "问题发现" : "问题解决"}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="discovered"
            fill="url(#discoveredGradient)"
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            fill="url(#resolvedGradient)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="discovered"
            name="discovered"
            stroke="#00B4D8"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#00B4D8", strokeWidth: 2, stroke: "#FFFFFF" }}
            activeDot={{ r: 6, fill: "#00B4D8", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="resolved"
            name="resolved"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
            activeDot={{ r: 6, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
