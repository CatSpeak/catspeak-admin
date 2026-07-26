import React, { useState, useEffect } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface AvatarProps {
  name?: string | null;
  url?: string | null;
  size?: AvatarSize;
  className?: string;
  alt?: string;
}

const sizeClasses: Record<string, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-14 h-14 text-lg",
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = "md",
  className = "",
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  const trimmedName = name?.trim();
  const displayChar = trimmedName ? trimmedName.charAt(0).toUpperCase() : "?";

  const isNumericSize = typeof size === "number";
  const sizeClass = typeof size === "string" ? sizeClasses[size] || size : "";

  const customStyle: React.CSSProperties = isNumericSize
    ? {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(12, Math.floor(size * 0.4))}px`,
      }
    : {};

  const hasValidUrl = Boolean(url && !imageError);

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold rounded-full overflow-hidden shrink-0 select-none ${
        hasValidUrl ? "bg-gray-100" : "bg-primary text-white"
      } ${sizeClass} ${className}`}
      style={customStyle}
    >
      {hasValidUrl ? (
        <img
          src={url!}
          alt={alt || name || "Avatar"}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{displayChar}</span>
      )}
    </div>
  );
};

export default Avatar;
