import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = ["#7c3aed", "#f97316"];

const OutstandingChart = ({
  principal = 0,
  interest = 0,
}) => {
  const data = [
    {
      name: "Principal",
      value: principal,
    },
    {
      name: "Interest",
      value: interest,
    },
  ];

  const total = principal + interest;

  return (
    <div className="relative h-[260px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip
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
            }}
            itemStyle={{
              color: "#475569",
              fontSize: "12px",
              fontWeight: 600,
            }}
            formatter={(value) =>
              `₹${Number(value).toLocaleString(
                "en-IN"
              )}`
            }
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-xl font-bold text-slate-900">
          ₹{total.toLocaleString("en-IN")}
        </p>

        <p className="mt-1 font-mono text-[9px] font-medium uppercase tracking-widest text-slate-400">
          Outstanding
        </p>
      </div>
    </div>
  );
};

export default OutstandingChart;