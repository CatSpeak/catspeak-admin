import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { TrendingUp, TrendingDown } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  trendUp?: boolean;
  trendValue?: string;
  centerSubtext?: string;
}

export default function DonutChartJS({
  segments,
  trendUp,
  trendValue,
  centerSubtext,
}: DonutChartProps) {
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
    cutout: "70%",
    layout: {
      padding: 20,
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
          size: 13,
        },
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0 w-[240px] h-[240px]">
        <Doughnut data={data} options={options} />
        {(centerSubtext || trendValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Trend */}
            {trendValue && (
              <div className="flex items-center gap-1.5 text-xs mb-1">
                {trendUp ? (
                  <TrendingUp size={14} style={{ color: "#10B981" }} />
                ) : (
                  <TrendingDown size={14} style={{ color: "#EF4444" }} />
                )}
                <span
                  style={{ color: trendUp ? "#10B981" : "#EF4444" }}
                  className="font-medium"
                >
                  {trendValue}
                </span>
              </div>
            )}

            {/* Subtext */}
            {centerSubtext && (
              <p
                className="text-xs text-center"
                style={{ color: "var(--color-text-muted)" }}
              >
                {centerSubtext}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span style={{ color: "var(--color-text)" }}>{seg.label}</span>
            </div>
            <span style={{ color: "var(--color-text-muted)" }}>
              {seg.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
