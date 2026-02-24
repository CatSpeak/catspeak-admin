import { TABS } from "../constants";
import type { Tab } from "../types";

interface TabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabNav = ({ activeTab, onTabChange }: TabNavProps) => (
  <div className="bg-white border-b border-gray-200 px-6 sm:px-8 py-3 flex justify-center mb-4">
    <div className="flex flex-wrap space-x-8 text-sm font-medium text-gray-500 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`whitespace-nowrap pb-2 border-b-2 px-1 transition-colors mt-2 ${
            activeTab === key
              ? "border-primary text-gray-900"
              : "border-transparent hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default TabNav;
