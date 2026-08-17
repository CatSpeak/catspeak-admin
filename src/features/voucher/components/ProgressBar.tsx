export interface ProgressBarProps {
  usedCount: number
  totalUsageLimit?: number | null
  isUnlimitedUsage?: boolean
  className?: string
}

export default function ProgressBar({
  usedCount = 0,
  totalUsageLimit,
  isUnlimitedUsage = false,
  className = "",
}: ProgressBarProps) {
  const isUnlimited =
    isUnlimitedUsage || totalUsageLimit == null || totalUsageLimit <= 0

  const safeUsed = Math.max(0, usedCount)
  const safeTotal = isUnlimited ? null : Math.max(1, totalUsageLimit as number)

  const percentage = safeTotal
    ? Math.min(100, Math.max(0, (safeUsed / safeTotal) * 100))
    : 0

  return (
    <div className={`flex flex-col gap-1 min-w-[110px] w-28 sm:w-32 ${className}`}>
      {/* Label above and to the right: {usedCount}/{totalUsageLimit} */}
      <div className="flex items-center justify-end text-xs font-mono">
        <span className="font-medium text-gray-900">{safeUsed}</span>
        <span className="text-gray-400 font-normal">
          /{isUnlimited ? "∞" : totalUsageLimit}
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
