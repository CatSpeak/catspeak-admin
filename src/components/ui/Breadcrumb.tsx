import React from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      className={`flex items-center text-sm text-[#7B7979] mb-6 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        const content = (
          <span
            onClick={item.onClick}
            className={`${
              !isLast
                ? "cursor-pointer hover:text-[#990011] transition-colors"
                : "font-semibold text-[#990011]"
            }`}
          >
            {item.label}
          </span>
        )

        return (
          <React.Fragment key={index}>
            {!isLast && item.href ? (
              <Link to={item.href} className="flex items-center">
                {content}
              </Link>
            ) : (
              content
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 mx-1" />}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
