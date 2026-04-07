import React from "react";
import { DoorOpen, Users, Wifi, Radio } from "lucide-react";

interface Stats {
  total: number;
  active: number;
  oneToOne: number;
  group: number;
}

const statCards = [
  { key: "total" as const, label: "Total Rooms", icon: DoorOpen, color: "text-gray-700", bg: "bg-gray-50", iconBg: "bg-gray-100" },
  { key: "active" as const, label: "Active", icon: Wifi, color: "text-emerald-700", bg: "bg-emerald-50/50", iconBg: "bg-emerald-100" },
  { key: "oneToOne" as const, label: "1:1 Rooms", icon: Radio, color: "text-indigo-700", bg: "bg-indigo-50/50", iconBg: "bg-indigo-100" },
  { key: "group" as const, label: "Group Rooms", icon: Users, color: "text-amber-700", bg: "bg-amber-50/50", iconBg: "bg-amber-100" },
];

const RoomStats: React.FC<{ stats: Stats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map(({ key, label, icon: Icon, color, bg, iconBg }) => (
        <div key={key} className={`${bg} rounded-xl p-4 border border-gray-200/60 transition-all duration-300 hover:shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`${iconBg} rounded-lg p-2.5`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats[key]}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomStats;
