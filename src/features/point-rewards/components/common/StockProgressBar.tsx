import React from "react"

interface StockProgressBarProps {
  current: number
  total: number
  className?: string
}

export const StockProgressBar: React.FC<StockProgressBarProps> = ({
  current,
  total,
  className = "",
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0

  // Color logic matching figma:
  // - very low or 0: gray/red
  // - around 25%: amber/orange
  // - high (around 90%): deep orange / red
  const getBarColor = () => {
    if (current === 0) return "bg-gray-200"
    if (percentage > 80) return "bg-[#910B09]"
    if (percentage > 40) return "bg-amber-500"
    return "bg-orange-400"
  }

  return (
    <div className={`space-y-1.5 min-w-[120px] ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        <span className={current === 0 ? "text-red-500 font-bold" : ""}>
          {current.toLocaleString()}
        </span>
        <span className="text-gray-400 font-normal">/</span>
        <span className="text-gray-500 font-normal">{total.toLocaleString()}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default StockProgressBar
