import React from "react";
import { DoorOpen, Users, Wifi, Radio } from "lucide-react";
import SummaryCard from "../../../components/ui/SummaryCard";
import { useLanguage } from "../../../stores/languageStore";

interface Stats {
  total: number;
  active: number;
  oneToOne: number;
  group: number;
}

const RoomStats: React.FC<{ stats: Stats }> = ({ stats }) => {
  const { t } = useLanguage();

  const statCards = [
    { key: "total" as const, label: t.room.totalRooms, icon: DoorOpen, color: "text-gray-700", bg: "bg-gray-50", iconBg: "bg-gray-100" },
    { key: "active" as const, label: t.room.activeRooms, icon: Wifi, color: "text-emerald-700", bg: "bg-emerald-50/50", iconBg: "bg-emerald-100" },
    { key: "oneToOne" as const, label: t.room.oneToOneRooms, icon: Radio, color: "text-indigo-700", bg: "bg-indigo-50/50", iconBg: "bg-indigo-100" },
    { key: "group" as const, label: t.room.groupRooms, icon: Users, color: "text-amber-700", bg: "bg-amber-50/50", iconBg: "bg-amber-100" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map(({ key, label, icon: Icon, color, bg, iconBg }) => (
        <SummaryCard
          key={key}
          icon={<Icon size={18} />}
          label={label}
          value={stats[key]}
          className={bg}
          iconClassName={color}
          iconContainerClassName={iconBg}
        />
      ))}
    </div>
  );
};

export default RoomStats;
