interface DataPoint {
  month: string;
  credits: number;
  debits: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
}

export default function SimpleBarChart({ data }: SimpleBarChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((d) => [d.credits, d.debits])
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Credits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Debits</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 h-64">
        {data.map((item, idx) => {
          const creditHeight = (item.credits / maxValue) * 100;
          const debitHeight = (item.debits / maxValue) * 100;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-56">
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${creditHeight}%` }}
                    title={`Credits: ₹${item.credits.toLocaleString()}`}
                  ></div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-red-500 rounded-t transition-all hover:bg-red-600"
                    style={{ height: `${debitHeight}%` }}
                    title={`Debits: ₹${item.debits.toLocaleString()}`}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
