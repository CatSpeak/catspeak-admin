import React from "react"

export interface Tab {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div className={`border-b border-gray-200 shrink-0 ${className}`.trim()}>
      <nav className="flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`pb-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-black hover:border-gray-300"
              } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default Tabs
