import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export interface DonutDataItem {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data?: DonutDataItem[];
  height?: number;
  centerLabel?: string;
  innerRadius?: number;
  outerRadius?: number;
}

const defaultColors = ["#00B4D8", "#F4A100", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

const defaultData: DonutDataItem[] = [
  { name: "完整性问题", value: 342, color: "#00B4D8" },
  { name: "准确性问题", value: 256, color: "#F4A100" },
  { name: "一致性问题", value: 189, color: "#10B981" },
  { name: "规范性问题", value: 128, color: "#8B5CF6" },
  { name: "唯一性问题", value: 86, color: "#EC4899" },
];

export default function DonutChart({
  data = defaultData,
  height = 320,
  centerLabel,
  innerRadius = 70,
  outerRadius = 100,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
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
              `${value} 个 (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value, entry: unknown) => {
              const typedEntry = entry as { payload: DonutDataItem };
              const item = typedEntry.payload;
              return (
                <span className="text-sm text-slate-600">
                  {value}
                  <span className="ml-2 text-slate-400 tabular-nums">
                    {item.value}
                  </span>
                </span>
              );
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{
          position: "relative",
          marginTop: -(height + 36),
          height: height - 36,
        }}
      >
        <p className="text-xs text-slate-500 mb-1">
          {centerLabel || "问题总数"}
        </p>
        <p className="text-3xl font-bold text-slate-800 tabular-nums">
          {total.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
