import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "../../../components/ui/Card";

interface StatsCardProps {
  variant?: "gradient" | "default";
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    up: boolean;
  };
}

export default function StatsCard({
  variant = "default",
  title,
  value,
  subtitle,
  trend,
}: StatsCardProps) {
  const isGradient = variant === "gradient";

  return (
    <Card
      className={`animate-fade-in delay-3 ${
        isGradient
          ? "bg-linear-to-br from-secondary to-primary-dark text-white border-0 shadow-md"
          : "bg-surface border-border text-text shadow-sm"
      }`}
    >
      <h4
        className={`text-xs font-medium mb-2 ${
          isGradient ? "text-white/90" : "text-gray-500"
        }`}
      >
        {title}
      </h4>
      <p
        className={`text-2xl font-bold mb-1 ${
          isGradient ? "text-white" : "text-gray-800"
        }`}
      >
        {value}
      </p>

      {subtitle && (
        <p
          className={`text-xs ${
            isGradient ? "text-white/75" : "text-gray-500"
          }`}
        >
          {subtitle}
        </p>
      )}

      {trend && (
        <div className="flex items-center gap-1.5 mt-2 text-xs">
          {trend.up ? (
            <TrendingUp
              size={14}
              className={isGradient ? "text-white" : "text-success"}
            />
          ) : (
            <TrendingDown
              size={14}
              className={isGradient ? "text-white" : "text-danger"}
            />
          )}
          <span
            className={`${
              isGradient
                ? "text-white/90"
                : trend.up
                  ? "text-success"
                  : "text-danger"
            }`}
          >
            {trend.value}
          </span>
        </div>
      )}
    </Card>
  );
}
