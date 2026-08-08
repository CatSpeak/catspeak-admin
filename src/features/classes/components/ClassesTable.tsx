import React from "react";
import Badge from "../../../components/ui/Badge";
import { useLanguage } from "../../../stores/languageStore";
import FlagBadge from "../../../components/ui/FlagBadge";
import type { AdminClass } from "../types";
import { ClassStatusBadge } from "./ClassStatusBadge";

interface ClassesTableProps {
  classes: AdminClass[];
  onView: (cl: AdminClass) => void;
}

export const ClassesTable: React.FC<ClassesTableProps> = ({ classes, onView }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-primary text-white sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.id}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.name}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.course}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.teacher}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.language}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.levels}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.status}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.capacity}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.enrolled}
            </th>
            <th className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap">
              {t.classes.price}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {classes.map((cl, idx) => (
            <tr
              key={cl.id}
              onClick={() => onView(cl)}
              className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
              }`}
            >
              <td className="px-4 py-3 text-sm font-bold text-gray-800 tabular-nums whitespace-nowrap">
                {cl.id}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {cl.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {cl.courseName ?? "—"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {cl.teacherName ?? "—"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                <FlagBadge languageType={cl.language} />
              </td>
              <td className="px-4 py-3 text-sm">
                {cl.levels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {cl.levels.map((level) => (
                      <Badge key={level} type="Gray" title={level} />
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <ClassStatusBadge
                  status={cl.status}
                  label={t.classes.statuses[cl.status as keyof typeof t.classes.statuses] ?? cl.status}
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {cl.capacity}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-700 tabular-nums whitespace-nowrap">
                {cl.enrolledCount}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {cl.price.toLocaleString("vi-VN")} ₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassesTable;
