import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

export interface ColumnDataItem {
  name: string;
  current: number;
  previous?: number;
}

interface ColumnChartProps {
  data?: ColumnDataItem[];
  height?: number;
  showPrevious?: boolean;
}

const defaultData: ColumnDataItem[] = [
  { name: "客户部", current: 94.2, previous: 91.5 },
  { name: "交易部", current: 89.6, previous: 87.2 },
  { name: "产品部", current: 92.3, previous: 93.1 },
  { name: "财务部", current: 86.8, previous: 84.9 },
  { name: "风控部", current: 91.5, previous: 89.7 },
  { name: "运营部", current: 88.2, previous: 86.5 },
  { name: "科技部", current: 95.1, previous: 92.8 },
  { name: "市场部", current: 85.4, previous: 83.6 },
];

export default function ColumnChart({
  data = defaultData,
  height = 320,
  showPrevious = true,
}: ColumnChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#CBD5E1" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(15,44,89,0.10)",
              padding: "12px 16px",
            }}
            formatter={(value: number) => [`${value.toFixed(1)} 分`]}
          />
          {showPrevious && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: 8 }}
              formatter={(value) => (
                <span className="text-sm text-slate-600">
                  {value === "current" ? "本期得分" : "上期得分"}
                </span>
              )}
            />
          )}
          {showPrevious && (
            <Bar
              dataKey="previous"
              name="previous"
              fill="#CBD5E1"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          )}
          <Bar
            dataKey="current"
            name="current"
            radius={[4, 4, 0, 0]}
            barSize={20}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.current >= 95
                    ? "#10B981"
                    : entry.current >= 90
                    ? "#00B4D8"
                    : entry.current >= 85
                    ? "#F4A100"
                    : "#EF4444"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
