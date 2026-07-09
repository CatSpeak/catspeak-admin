import React from "react";

export type BadgeType = "Red" | "Orange" | "Yellow" | "Green" | "Blue" | "Gray";

// Định nghĩa props cho component
interface BadgeProps {
  title: string;
  type?: BadgeType;
  showDot?: boolean;
}

// Định nghĩa cấu trúc config cho từng loại màu
interface ColorConfig {
  colorClass: string;
  dotClass: string;
}

// Mapping object chứa các class Tailwind tương ứng với từng type
const colorMap: Record<NonNullable<BadgeProps["type"]>, ColorConfig> = {
  Green: {
    colorClass: "bg-green-50 text-green-600 border-green-200",
    dotClass: "bg-green-500",
  },
  Orange: {
    colorClass: "bg-orange-50 text-orange-600 border-orange-200",
    dotClass: "bg-orange-500",
  },
  Yellow: {
    colorClass: "bg-yellow-50 text-yellow-700 border-yellow-200", // Dùng text-yellow-700 để dễ đọc hơn trên nền sáng
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
  Gray: {
    colorClass: "bg-gray-50 text-gray-600 border-gray-200",
    dotClass: "bg-gray-500",
  },
};

export default function Badge({
  title,
  type = "Gray", // Giá trị mặc định nếu không truyền type
  showDot = false, // Giá trị mặc định nếu không truyền showDot
}: BadgeProps) {
  // Lấy config màu dựa trên type, fallback về Gray nếu có lỗi
  const { colorClass, dotClass } = colorMap[type] || colorMap.Gray;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {/* Chỉ hiển thị dấu chấm nếu showDot là true */}
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      )}
      {title}
    </span>
  );
}
