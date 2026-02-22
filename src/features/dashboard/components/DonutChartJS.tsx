import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  const series = segments.map((s) => s.value);
  const labels = segments.map((s) => s.label);
  const colors = segments.map((s) => s.color);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      parentHeightOffset: 0,
    },
    labels: labels,
    colors: colors,
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "70%",
        },
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0 w-60 h-60 flex justify-center items-center">
        <Chart options={options} series={series} type="donut" width={240} />
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
