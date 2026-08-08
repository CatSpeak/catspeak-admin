import React from "react";
import { Eye } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { useLanguage } from "../../../stores/languageStore";
import type { AdminClass } from "../types";
import { ClassStatusBadge } from "./ClassStatusBadge";

interface ClassesTableProps {
  classes: AdminClass[];
  onView: (cl: AdminClass) => void;
}

export const ClassesTable: React.FC<ClassesTableProps> = ({ classes, onView }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3 font-medium">{t.classes.id}</th>
            <th className="px-4 py-3 font-medium">{t.classes.name}</th>
            <th className="px-4 py-3 font-medium">{t.classes.course}</th>
            <th className="px-4 py-3 font-medium">{t.classes.teacher}</th>
            <th className="px-4 py-3 font-medium">{t.classes.language}</th>
            <th className="px-4 py-3 font-medium">{t.classes.levels}</th>
            <th className="px-4 py-3 font-medium">{t.classes.status}</th>
            <th className="px-4 py-3 text-center font-medium">
              {t.classes.capacity}
            </th>
            <th className="px-4 py-3 text-center font-medium">
              {t.classes.enrolled}
            </th>
            <th className="px-4 py-3 font-medium">{t.classes.price}</th>
            <th className="px-4 py-3 text-right font-medium">
              {t.common.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cl) => (
            <tr
              key={cl.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-500">{cl.id}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{cl.name}</td>
              <td className="px-4 py-3 text-gray-600">
                {cl.courseName ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {cl.teacherName ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">{cl.language}</td>
              <td className="px-4 py-3">
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
              <td className="px-4 py-3">
                <ClassStatusBadge
                  status={cl.status}
                  label={t.classes.statuses[cl.status as keyof typeof t.classes.statuses] ?? cl.status}
                />
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {cl.enrolledCount}/{cl.capacity}
              </td>
              <td className="px-4 py-3 text-center font-medium text-gray-800">
                {cl.enrolledCount}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {cl.price.toLocaleString("vi-VN")} ₫
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye size={14} />}
                  onClick={() => onView(cl)}
                >
                  {t.classes.viewDetails}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
