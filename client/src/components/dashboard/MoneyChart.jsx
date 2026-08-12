import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const MoneyChart = ({
  given = 0,
  borrowed = 0,
}) => {
  const data = [
    {
      name: "Given",
      amount: given,
    },
    {
      name: "Borrowed",
      amount: borrowed,
    },
  ];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 11,
              fontWeight: 500,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#94a3b8",
              fontSize: 10,
            }}
          />

          <Tooltip
            cursor={{
              fill: "#f8fafc",
            }}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              color: "#0f172a",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            labelStyle={{
              color: "#475569",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#7c3aed",
              fontSize: "12px",
              fontWeight: 600,
            }}
            formatter={(value) =>
              `₹${Number(value).toLocaleString(
                "en-IN"
              )}`
            }
          />

          <Bar
            dataKey="amount"
            fill="#7c3aed"
            radius={[7, 7, 0, 0]}
            maxBarSize={55}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoneyChart;