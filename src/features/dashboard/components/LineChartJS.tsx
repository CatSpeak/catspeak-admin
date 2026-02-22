import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface LineDataItem {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineDataItem[];
  height?: number;
}

export default function LineChartJS({ data, height = 220 }: LineChartProps) {
  const series = [
    {
      name: "Value",
      data: data.map((d) => d.value),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: height,
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: ["#C8102E"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "solid",
      opacity: 0.1,
    },
    markers: {
      size: 4,
      colors: ["#C8102E"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        style: {
          colors: "#9CA3AF",
          fontSize: "11px",
        },
      },
      tooltip: { enabled: false },
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
      y: {
        formatter: (val) => `${val} users`,
      },
    },
  };

  return (
    <div>
      <h3
        className="text-xl font-semibold mb-3"
        style={{ color: "var(--color-text)" }}
      >
        Activity Trend
      </h3>
      <div style={{ height: `${height}px` }} className="w-full">
        <Chart
          options={options}
          series={series}
          type="area"
          height={height}
          width="100%"
        />
      </div>
    </div>
  );
}
