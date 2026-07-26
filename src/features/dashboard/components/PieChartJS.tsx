import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import { useLanguage } from "../../../stores/languageStore";

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
  const { t } = useLanguage();
  const series = useMemo(() => segments.map((s) => s.value), [segments]);
  const labels = useMemo(() => segments.map((s) => s.label), [segments]);
  const colors = useMemo(() => segments.map((s) => s.color), [segments]);

  const totalText = t.common.total;
  const maleText = t.common.male;
  const femaleText = t.common.female;

  const options: ApexOptions = useMemo(() => ({
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
            <div style="font-size: 12px;">${totalText}: ${seg.value.toLocaleString()}</div>
            <div style="font-size: 12px;">${maleText}: ${seg.male.toLocaleString()}</div>
            <div style="font-size: 12px;">${femaleText}: ${seg.female.toLocaleString()}</div>
          </div>
        `;
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
  }), [colors, labels, segments, totalText, maleText, femaleText]);

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
                    {maleText}: {seg.male.toLocaleString()}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {femaleText}: {seg.female.toLocaleString()}
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
