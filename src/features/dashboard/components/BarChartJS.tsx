import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface BarDataItem {
  label: string;
  values: [number, number];
  annotation?: string;
}

interface BarChartProps {
  data: BarDataItem[];
  title?: string;
  periodLabel?: string;
  height?: number;
}

export default function BarChartJS({
  data,
  title = "Detail",
  periodLabel,
  height = 240,
}: BarChartProps) {
  const series = [
    {
      name: "Primary",
      data: data.map((d) => d.values[0]),
    },
    {
      name: "Secondary",
      data: data.map((d) => d.values[1]),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: height,
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    colors: ["#C8102E", "#E8E8E8"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
        },
      },
    },
    grid: {
      borderColor: "#F3F4F6",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h3>
        {periodLabel && (
          <span
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {periodLabel}
          </span>
        )}
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }} className="w-full">
        <Chart
          options={options}
          series={series}
          type="bar"
          height={height}
          width="100%"
        />
      </div>
    </div>
  );
}
