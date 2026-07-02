import React from "react"

export interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

export default function PageTitle({
  children,
  size = "2xl",
  className = "mb-6",
  ...props
}: PageTitleProps) {
  const sizeClasses = {
    sm: "text-xl", // 20px
    md: "text-2xl", // 24px
    lg: "text-3xl", // 30px
    xl: "text-4xl", // 36px
    "2xl": "text-[40px]", // 40px
  }

  return (
    <h1
      className={`font-semibold text-[#1A1A1A] ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </h1>
  )
}
