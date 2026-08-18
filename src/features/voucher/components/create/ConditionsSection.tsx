import React from "react"
import { ListTodo, Search, X, Loader2 } from "lucide-react"
import { useLanguage } from "../../../../stores/languageStore"
import type { AdminCourse, AdminClass } from "../../../classes/types"

interface ConditionsSectionProps {
  scopeType: "All" | "SpecificCourses" | "SpecificClasses"
  setScopeType: (scope: "All" | "SpecificCourses" | "SpecificClasses") => void
  courseIds: number[]
  setCourseIds: React.Dispatch<React.SetStateAction<number[]>>
  toggleCourse: (id: number) => void
  classIds: number[]
  setClassIds: React.Dispatch<React.SetStateAction<number[]>>
  toggleClass: (id: number) => void
  isOnlyNewUser: boolean
  setIsOnlyNewUser: (val: boolean) => void
  isNotCombineOther: boolean
  setIsNotCombineOther: (val: boolean) => void
  minLearners: number
  setMinLearners: (val: number) => void
  itemSearch: string
  setItemSearch: (search: string) => void
  loadingItems: boolean
  filteredCourses: AdminCourse[]
  filteredClasses: AdminClass[]
}

export const ConditionsSection: React.FC<ConditionsSectionProps> = ({
  scopeType,
  setScopeType,
  courseIds,
  setCourseIds,
  toggleCourse,
  classIds,
  setClassIds,
  toggleClass,
  isOnlyNewUser,
  setIsOnlyNewUser,
  isNotCombineOther,
  setIsNotCombineOther,
  minLearners,
  setMinLearners,
  itemSearch,
  setItemSearch,
  loadingItems,
  filteredCourses,
  filteredClasses,
}) => {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
          <ListTodo size={18} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base">
            {t.vouchers.create.conditions}
          </h2>
          <p className="text-xs text-gray-500">
            {t.vouchers.create.conditionsDesc}
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Scope Type Selector */}
        <div className="space-y-2">
          <label className="block font-semibold text-gray-700">
            {t.vouchers.create.scopeType} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                scopeType === "All"
                  ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="scopeType"
                value="All"
                checked={scopeType === "All"}
                onChange={() => setScopeType("All")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs">{t.vouchers.create.scopeAll}</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                scopeType === "SpecificCourses"
                  ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="scopeType"
                value="SpecificCourses"
                checked={scopeType === "SpecificCourses"}
                onChange={() => setScopeType("SpecificCourses")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs">{t.vouchers.create.scopeCourses}</span>
            </label>

            <label
              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                scopeType === "SpecificClasses"
                  ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="scopeType"
                value="SpecificClasses"
                checked={scopeType === "SpecificClasses"}
                onChange={() => setScopeType("SpecificClasses")}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs">{t.vouchers.create.scopeClasses}</span>
            </label>
          </div>
        </div>

        {/* Sub-selector: Specific Courses */}
        {scopeType === "SpecificCourses" && (
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder={t.vouchers.create.searchCourses}
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                <span className="font-semibold text-blue-700">
                  {t.vouchers.create.selectedCount}: {courseIds.length}
                </span>
                {courseIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCourseIds([])}
                    className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <X size={12} /> {t.vouchers.create.clearAll}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100">
              {loadingItems ? (
                <div className="py-6 text-center text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  {t.vouchers.create.loadingCourses}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="py-6 text-center text-gray-400 italic">
                  {t.vouchers.create.noCoursesFound}
                </div>
              ) : (
                filteredCourses.map((c) => {
                  const isChecked = courseIds.includes(c.id)
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer select-none transition-colors ${
                        isChecked
                          ? "bg-blue-50 text-blue-950"
                          : "hover:bg-white text-gray-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCourse(c.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs">{c.name}</span>
                        <span className="text-[11px] text-gray-400 ml-2">
                          (ID: {c.id} ·{" "}
                          {c.language || t.vouchers.create.languageDefault} ·{" "}
                          {c.classCount || 0}{" "}
                          {t.vouchers.create.classesCountSuffix})
                        </span>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Sub-selector: Specific Classes */}
        {scopeType === "SpecificClasses" && (
          <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder={t.vouchers.create.searchClasses}
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                <span className="font-semibold text-blue-700">
                  {t.vouchers.create.selectedCount}: {classIds.length}
                </span>
                {classIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setClassIds([])}
                    className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <X size={12} /> {t.vouchers.create.clearAll}
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100">
              {loadingItems ? (
                <div className="py-6 text-center text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  {t.vouchers.create.loadingClasses}
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="py-6 text-center text-gray-400 italic">
                  {t.vouchers.create.noClassesFound}
                </div>
              ) : (
                filteredClasses.map((cl) => {
                  const isChecked = classIds.includes(cl.id)
                  return (
                    <label
                      key={cl.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer select-none transition-colors ${
                        isChecked
                          ? "bg-blue-50 text-blue-950"
                          : "hover:bg-white text-gray-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleClass(cl.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 truncate">
                        <span className="font-bold text-xs">{cl.name}</span>
                        <span className="text-[11px] text-gray-400 ml-2">
                          ({t.vouchers.create.codePrefix}: #{cl.id} ·{" "}
                          {cl.teacherName || t.vouchers.create.teacherDefault} ·{" "}
                          {cl.price
                            ? `${cl.price.toLocaleString("vi-VN")} đ`
                            : t.vouchers.create.freePrice}
                          )
                        </span>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Checkboxes & MinLearners */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 items-center">
          <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 select-none">
            <input
              type="checkbox"
              checked={isOnlyNewUser}
              onChange={(e) => setIsOnlyNewUser(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-medium select-none">
              {t.vouchers.create.isOnlyNewUser}
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-gray-700 select-none">
            <input
              type="checkbox"
              checked={isNotCombineOther}
              onChange={(e) => setIsNotCombineOther(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-medium select-none">
              {t.vouchers.create.isNotCombineOther}
            </span>
          </label>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-gray-600">
              {t.vouchers.create.minLearners}
            </label>
            <input
              type="number"
              min={1}
              value={minLearners}
              onChange={(e) =>
                setMinLearners(Math.max(1, Number(e.target.value)))
              }
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
