import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data?: PieDataItem[];
  height?: number;
}

const defaultColors = ["#00B4D8", "#F4A100", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6"];

const defaultData: PieDataItem[] = [
  { name: "客户数据域", value: 3820, color: "#00B4D8" },
  { name: "交易数据域", value: 2945, color: "#F4A100" },
  { name: "产品数据域", value: 2180, color: "#10B981" },
  { name: "财务数据域", value: 1650, color: "#8B5CF6" },
  { name: "风控数据域", value: 1220, color: "#EC4899" },
  { name: "运营数据域", value: 890, color: "#6366F1" },
];

export default function PieChart({
  data = defaultData,
  height = 320,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={110}
            innerRadius={0}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={2}
            stroke="#FFFFFF"
            label={({ name, percent }) => (
              percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
            )}
            labelLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15,44,89,0.10)",
              padding: "12px 16px",
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-sm text-slate-600">{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
