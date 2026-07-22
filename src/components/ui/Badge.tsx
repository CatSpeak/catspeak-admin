import React from "react";

export type BadgeType =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Green"
  | "Blue"
  | "Purple"
  | "Gray";

interface BadgeProps {
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  type?: BadgeType;
  showDot?: boolean;
  className?: string;
}

interface ColorConfig {
  colorClass: string;
  dotClass: string;
}

const colorMap: Record<BadgeType, ColorConfig> = {
  Green: {
    colorClass: "bg-green-50 text-green-600 border-green-200",
    dotClass: "bg-green-500",
  },
  Orange: {
    colorClass: "bg-orange-50 text-orange-600 border-orange-200",
    dotClass: "bg-orange-500",
  },
  Yellow: {
    colorClass: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  Red: {
    colorClass: "bg-red-50 text-red-600 border-red-200",
    dotClass: "bg-red-500",
  },
  Blue: {
    colorClass: "bg-blue-50 text-blue-600 border-blue-200",
    dotClass: "bg-blue-500",
  },
  Purple: {
    colorClass: "bg-violet-50 text-violet-700 border-violet-200",
    dotClass: "bg-violet-500",
  },
  Gray: {
    colorClass: "bg-gray-50 text-gray-600 border-gray-200",
    dotClass: "bg-gray-500",
  },
};

export default function Badge({
  title,
  children,
  icon,
  type = "Gray",
  showDot = false,
  className = "",
}: BadgeProps) {
  const { colorClass, dotClass } = colorMap[type] || colorMap.Gray;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${colorClass} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {title ?? children}
    </span>
  );
}
