import React, { type ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  desc?: string;
  rightButtons?: ReactNode[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  desc,
  rightButtons,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row md:justify-between gap-4">
      {/* Khối bên trái: Icon + Nội dung tiêu đề */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>

      {/* Khối bên phải: Các nút chức năng */}
      {rightButtons && rightButtons.length > 0 && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {rightButtons.map((button, index) => (
            <React.Fragment key={index}>{button}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
