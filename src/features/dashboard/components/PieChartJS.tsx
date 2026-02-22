import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

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
  const series = segments.map((s) => s.value);
  const labels = segments.map((s) => s.label);
  const colors = segments.map((s) => s.color);

  const options: ApexOptions = {
    chart: {
      type: "pie",
      parentHeightOffset: 0,
    },
    labels: labels,
    colors: colors,
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      custom: function ({ seriesIndex }) {
        const seg = segments[seriesIndex];
        return `
          <div style="padding: 12px; border-radius: 8px; font-family: inherit;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${seg.label}</div>
            <div style="font-size: 12px;">Total: ${seg.value.toLocaleString()}</div>
            <div style="font-size: 12px;">Male: ${seg.male.toLocaleString()}</div>
            <div style="font-size: 12px;">Female: ${seg.female.toLocaleString()}</div>
          </div>
        `;
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-50 h-50 flex justify-center items-center">
        <Chart options={options} series={series} type="pie" width={200} />
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
