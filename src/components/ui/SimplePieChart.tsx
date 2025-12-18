interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
}

export default function SimplePieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex items-center justify-center gap-8">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const prevPercentages = data
              .slice(0, idx)
              .reduce((sum, d) => sum + (d.value / total) * 100, 0);

            const circumference = 2 * Math.PI * 40;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((prevPercentages / 100) * circumference);

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">
                  {item.value} ({percentage}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
