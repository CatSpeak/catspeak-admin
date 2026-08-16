import { useState } from "react";
import { Check } from "lucide-react";
import type { Column as TanstackColumn } from "@tanstack/react-table";
import { useLanguage } from "../../../../stores/languageStore";
import "../types"; // ensure TanStack ColumnMeta module augmentation is loaded

export interface ColumnFilterControlProps<T> {
  column: TanstackColumn<T, unknown>;
  onFilterSubmit?: (attribute: string, value: unknown) => void;
}

export function ColumnTextFilterInput<T>({
  column,
  label,
  onFilterSubmit,
}: {
  column: TanstackColumn<T, unknown>;
  label: string;
  onFilterSubmit?: (attribute: string, value: unknown) => void;
}) {
  const { t } = useLanguage();
  const filterValue = column.getFilterValue();
  const filterString = typeof filterValue === "string" ? filterValue : "";
  const [localText, setLocalText] = useState(filterString);
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);

  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue);
    setLocalText(filterString);
  }

  const submitFilter = () => {
    const val = localText || undefined;
    column.setFilterValue(val);
    onFilterSubmit?.(column.id, val);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        type="text"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitFilter();
          }
        }}
        placeholder={`${t.common.filter} ${label.toLowerCase()}…`}
        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
      />
    </div>
  );
}

export default function ColumnFilterControl<T>({
  column,
  onFilterSubmit,
}: ColumnFilterControlProps<T>) {
  const meta = column.columnDef.meta;
  const label =
    typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id;
  const options = meta?.values;
  const filterValue = column.getFilterValue();

  if (options && options.length > 0) {
    const selected: (string | number | boolean)[] = Array.isArray(filterValue)
      ? filterValue
      : [];

    const toggle = (value: string | number | boolean) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      const val = next.length ? next : undefined;
      column.setFilterValue(val);
      onFilterSubmit?.(column.id, val);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500">{label}</label>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => toggle(opt.value)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                  active
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {active && <Check size={12} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ColumnTextFilterInput
      column={column}
      label={label}
      onFilterSubmit={onFilterSubmit}
    />
  );
}
