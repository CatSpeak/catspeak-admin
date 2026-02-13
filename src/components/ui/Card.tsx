import React, { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${
        !noPadding ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
