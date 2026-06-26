import React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

export interface SummaryCardProps {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
  trend?: { value: string; up: boolean }
  subtitle?: React.ReactNode
  color?: string // hex color for icon bg/text
  iconClassName?: string // extra classes for the icon itself
  iconContainerClassName?: string // fallback if using tailwind classes instead of color hex
  loading?: boolean
  variant?: "default" | "gradient"
  className?: string // extra classes for the card wrapper
}

export default function SummaryCard({
  icon,
  label,
  value,
  trend,
  subtitle,
  color,
  iconClassName,
  iconContainerClassName = "",
  loading,
  variant = "default",
  className = "",
}: SummaryCardProps) {
  const isGradient = variant === "gradient"

  const cardBaseClasses =
    "rounded-xl p-5 border shadow-sm relative overflow-hidden"
  const cardVariantClasses = isGradient
    ? "bg-linear-to-br from-secondary to-primary-dark text-white border-0"
    : "bg-white border-gray-200 text-gray-900"

  // If color is provided, we use inline styles for the icon container
  const iconContainerStyle =
    color && !isGradient ? { backgroundColor: `${color}15`, color: color } : {}

  return (
    <div className={`${cardBaseClasses} ${cardVariantClasses} ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              isGradient ? "bg-white/20 text-white" : ""
            } ${iconContainerClassName}`}
            style={iconContainerStyle}
          >
            {iconClassName ? <div className={iconClassName}>{icon}</div> : icon}
          </div>
        )}
        <span
          className={`text-sm font-semibold tracking-wide ${
            isGradient ? "text-white/90" : "text-gray-600"
          }`}
        >
          {label}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse mt-2">
          <div
            className={`h-8 rounded w-2/3 ${
              isGradient ? "bg-white/20" : "bg-gray-200/60"
            }`}
          />
        </div>
      ) : (
        <div className="mt-1">
          <div className="text-3xl font-extrabold tracking-tight">{value}</div>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${
                isGradient ? "text-white/75" : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={`flex items-center gap-1.5 mt-2 text-xs font-medium`}
            >
              {trend.up ? (
                <TrendingUp
                  size={14}
                  className={isGradient ? "text-white" : "text-emerald-600"}
                />
              ) : (
                <TrendingDown
                  size={14}
                  className={isGradient ? "text-white" : "text-rose-600"}
                />
              )}
              <span
                className={
                  isGradient
                    ? "text-white/90"
                    : trend.up
                      ? "text-emerald-600"
                      : "text-rose-600"
                }
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
