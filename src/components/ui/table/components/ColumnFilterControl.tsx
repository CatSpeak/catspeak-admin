import { useState } from "react";
import { Check, Calendar, X } from "lucide-react";
import type { Column as TanstackColumn } from "@tanstack/react-table";
import { useLanguage } from "../../../../stores/languageStore";
import "../types"; // ensure TanStack ColumnMeta module augmentation is loaded

export interface ColumnFilterControlProps<T> {
  column: TanstackColumn<T, unknown>;
  onFilterSubmit?: (
    attribute: string,
    value: unknown,
    toDate?: string,
  ) => void;
}

export function ColumnTextFilterInput<T>({
  column,
  label,
  onFilterSubmit,
}: {
  column: TanstackColumn<T, unknown>;
  label: string;
  onFilterSubmit?: (
    attribute: string,
    value: unknown,
    toDate?: string,
  ) => void;
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

  const submitFilter = (textToSubmit?: string) => {
    const raw = textToSubmit !== undefined ? textToSubmit : localText;
    const trimmed = raw.trim();
    const val = trimmed.length > 0 ? trimmed : undefined;
    column.setFilterValue(val);
    onFilterSubmit?.(column.id, val);
  };

  const handleClear = () => {
    setLocalText("");
    submitFilter("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={() => submitFilter()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitFilter();
            }
          }}
          placeholder={`${t.common.filter} ${label.toLowerCase()}…`}
          className="w-full pl-3 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
        {localText && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            title="Xóa"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function ColumnDurationFilterInput<T>({
  column,
  label,
  onFilterSubmit,
}: {
  column: TanstackColumn<T, unknown>;
  label: string;
  onFilterSubmit?: (
    attribute: string,
    value: unknown,
    toDate?: string,
  ) => void;
}) {
  const filterValue = column.getFilterValue() as
    | [string, string]
    | { fromDate?: string; toDate?: string }
    | undefined;

  const initialFrom = Array.isArray(filterValue)
    ? (filterValue[0] ?? "")
    : (filterValue?.fromDate ?? "");
  const initialTo = Array.isArray(filterValue)
    ? (filterValue[1] ?? "")
    : (filterValue?.toDate ?? "");

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);

  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue);
    setFromDate(initialFrom);
    setToDate(initialTo);
  }

  const applyDurationFilter = (newFrom: string, newTo: string) => {
    const hasFrom = newFrom.trim().length > 0;
    const hasTo = newTo.trim().length > 0;
    const val = hasFrom || hasTo ? [newFrom.trim(), newTo.trim()] : undefined;
    column.setFilterValue(val);
    onFilterSubmit?.(
      column.id,
      hasFrom ? newFrom.trim() : undefined,
      hasTo ? newTo.trim() : undefined,
    );
  };

  const handleFromChange = (newFrom: string) => {
    setFromDate(newFrom);
    applyDurationFilter(newFrom, toDate);
  };

  const handleToChange = (newTo: string) => {
    setToDate(newTo);
    applyDurationFilter(fromDate, newTo);
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    applyDurationFilter("", "");
  };

  return (
    <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-400 font-normal">Từ:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromChange(e.target.value)}
            className="text-xs bg-transparent border-none font-medium focus:outline-none cursor-pointer text-gray-700"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all shadow-sm">
          <span className="text-gray-400 font-normal">Đến:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleToChange(e.target.value)}
            className="text-xs bg-transparent border-none font-medium focus:outline-none cursor-pointer text-gray-700"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Xóa bộ lọc ngày"
          >
            <X size={14} />
          </button>
        )}
      </div>
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
  const isDuration = meta?.isDuration;
  const filterValue = column.getFilterValue();

  if (isDuration) {
    return (
      <ColumnDurationFilterInput
        column={column}
        label={label}
        onFilterSubmit={onFilterSubmit}
      />
    );
  }

  if (options && options.length > 0) {
    const selected: (string | number | boolean)[] = Array.isArray(filterValue)
      ? filterValue
      : [];

    const toggle = (value: string | number | boolean) => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      const val = next.length > 0 ? next : undefined;
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
