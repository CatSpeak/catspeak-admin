interface ReportSummaryCardProps {
  title: string;
  mainValue: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  showPercentage?: number;
}

export default function ReportSummaryCard({
  title,
  mainValue,
  subtitle,
  bgColor,
  textColor,
  showPercentage,
}: ReportSummaryCardProps) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md relative"
      style={{ backgroundColor: bgColor }}
    >
      {/* Title */}
      <h3 className="text-sm font-semibold mb-2" style={{ color: textColor }}>
        {title}
      </h3>

      {/* Main Value */}
      <p className="text-3xl font-bold mb-2" style={{ color: textColor }}>
        {mainValue}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-xs leading-relaxed"
          style={{ color: textColor, opacity: 0.8 }}
        >
          {subtitle}
        </p>
      )}

      {/* Percentage Badge (optional) */}
      {showPercentage !== undefined && (
        <div className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1 shadow-sm">
          <span className="text-xs font-bold" style={{ color: textColor }}>
            {showPercentage}%
          </span>
        </div>
      )}
    </div>
  );
}
