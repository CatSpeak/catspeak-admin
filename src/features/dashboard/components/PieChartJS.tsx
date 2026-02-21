import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieSegment {
  label: string;
  value: number;
  color: string;
  male: number;
  female: number;
}

interface PieChartProps {
  segments: PieSegment[];
  showLegend?: boolean;
}

export default function PieChartJS({
  segments,
  showLegend = true,
}: PieChartProps) {
  const data = {
    labels: segments.map((s) => s.label),
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: segments.map((s) => s.color),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "0%",
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const segment = segments[context.dataIndex];
            return [
              `Total: ${segment.value.toLocaleString()}`,
              `Male: ${segment.male.toLocaleString()}`,
              `Female: ${segment.female.toLocaleString()}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-50 h-50">
        <Doughnut data={data} options={options} />
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="w-full space-y-2">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="flex items-start justify-between text-xs"
            >
              <div className="flex items-start gap-2">
                <span
                  className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <div className="flex flex-col">
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {seg.value.toLocaleString()}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Male: {seg.male.toLocaleString()}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Female: {seg.female.toLocaleString()}
                  </span>
                </div>
              </div>
              <span
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                {seg.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
