import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface AreaDataItem {
  label: string;
  accountUsers: number;
  activeUsers: number;
}

interface AreaChartProps {
  data: AreaDataItem[];
  height?: number;
}

export default function AreaChartJS({ data, height = 300 }: AreaChartProps) {
  const series = [
    {
      name: "Account users",
      data: data.map((d) => d.accountUsers),
    },
    {
      name: "Active users",
      data: data.map((d) => d.activeUsers),
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
    colors: ["#C8102E", "#FFA500"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "solid",
      opacity: 0.3,
    },
    markers: {
      size: 0,
      hover: { size: 6 },
      strokeWidth: 2,
      strokeColors: "#fff",
    },
    xaxis: {
      categories: data.map((d) => d.label),
      tooltip: { enabled: false },
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
        formatter: (value: number) => {
          if (value >= 1000) return (value / 1000).toFixed(1) + "k";
          return value.toString();
        },
      },
    },
    grid: {
      borderColor: "#F3F4F6",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      x: { show: true },
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  };

  return (
    <div>
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
