import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Primary",
        data: data.map((d) => d.values[0]),
        backgroundColor: "#C8102E",
        borderRadius: 4,
        barThickness: 12,
      },
      {
        label: "Secondary",
        data: data.map((d) => d.values[1]),
        backgroundColor: "#E8E8E8",
        borderRadius: 4,
        barThickness: 12,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#9CA3AF",
        },
      },
      y: {
        grid: {
          color: "#F3F4F6",
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#9CA3AF",
        },
      },
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
      <div style={{ height: `${height}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
