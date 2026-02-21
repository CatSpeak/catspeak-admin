import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

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
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Account users",
        data: data.map((d) => d.accountUsers),
        borderColor: "#C8102E",
        backgroundColor: "rgba(200, 16, 46, 0.3)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#C8102E",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Active users",
        data: data.map((d) => d.activeUsers),
        borderColor: "#FFA500",
        backgroundColor: "rgba(255, 165, 0, 0.3)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "#FFA500",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 12,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y ?? 0;
            return `${label}: ${value.toLocaleString()}`;
          },
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
          maxRotation: 0,
          minRotation: 0,
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
          callback: function (value) {
            if (typeof value === "number") {
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + "k";
              }
              return value;
            }
            return value ?? "";
          },
        },
      },
    },
  };

  return (
    <div>
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
