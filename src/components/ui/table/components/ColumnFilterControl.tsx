import { useState, useRef } from "react";
import { Check, Calendar, X } from "lucide-react";
import type { Column as TanstackColumn } from "@tanstack/react-table";
import { useLanguage } from "../../../../stores/languageStore";
import {
  formatDateToDisplay,
  parseDateToIsoDate,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../../lib/utils";
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
    const nextVal = trimmed.length > 0 ? trimmed : undefined;

    const currentRaw = column.getFilterValue();
    const currentVal =
      typeof currentRaw === "string" && currentRaw.trim().length > 0
        ? currentRaw.trim()
        : undefined;

    // Only apply and submit if value actually changed
    if (nextVal === currentVal) {
      return;
    }

    column.setFilterValue(nextVal);
    onFilterSubmit?.(column.id, nextVal);
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
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
            title="Xóa"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function DateDisplayPicker({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [localText, setLocalText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalText(value);
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalText(val);
    // If complete date dd/mm/yyyy (10 chars e.g. 16/08/2026 or 16-08-2026)
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(val.trim())) {
      onChange(val.trim());
    }
  };

  const handleBlur = () => {
    if (localText !== value) {
      onChange(localText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(localText.trim());
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value; // YYYY-MM-DD
    if (isoDate) {
      const display = formatDateToDisplay(isoDate);
      setLocalText(display);
      onChange(display);
    } else {
      setLocalText("");
      onChange("");
    }
  };

  const openNativePicker = () => {
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === "function") {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current.click();
      }
    }
  };

  const isoValue = parseDateToIsoDate(localText) || "";

  return (
    <div className="relative flex items-center gap-1">
      <input
        type="text"
        value={localText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={10}
        className="w-24 text-xs bg-transparent border-none font-medium focus:outline-none text-gray-700 placeholder-gray-400 cursor-text"
      />
      <button
        type="button"
        onClick={openNativePicker}
        className="text-gray-400 hover:text-primary transition-colors cursor-pointer p-0.5"
        title="Chọn ngày từ lịch"
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
      </button>
      <input
        type="date"
        ref={hiddenDateInputRef}
        value={isoValue}
        onChange={handleNativePickerChange}
        className="sr-only opacity-0 pointer-events-none absolute w-0 h-0"
        tabIndex={-1}
      />
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

  const rawFrom = Array.isArray(filterValue)
    ? (filterValue[0] ?? "")
    : (filterValue?.fromDate ?? "");
  const rawTo = Array.isArray(filterValue)
    ? (filterValue[1] ?? "")
    : (filterValue?.toDate ?? "");

  const initialFrom = formatDateToDisplay(rawFrom);
  const initialTo = formatDateToDisplay(rawTo);

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [prevFilterValue, setPrevFilterValue] = useState(filterValue);

  if (filterValue !== prevFilterValue) {
    setPrevFilterValue(filterValue);
    setFromDate(initialFrom);
    setToDate(initialTo);
  }

  const applyDurationFilter = (newFrom: string, newTo: string) => {
    const trimmedFrom = newFrom.trim();
    const trimmedTo = newTo.trim();
    const hasFrom = trimmedFrom.length > 0;
    const hasTo = trimmedTo.length > 0;
    const val = hasFrom || hasTo ? [trimmedFrom, trimmedTo] : undefined;

    const currentVal = column.getFilterValue() as
      | [string, string]
      | { fromDate?: string; toDate?: string }
      | undefined;
    const currentFrom = formatDateToDisplay(
      Array.isArray(currentVal)
        ? (currentVal[0] ?? "")
        : (currentVal?.fromDate ?? ""),
    );
    const currentTo = formatDateToDisplay(
      Array.isArray(currentVal)
        ? (currentVal[1] ?? "")
        : (currentVal?.toDate ?? ""),
    );

    if (trimmedFrom === currentFrom && trimmedTo === currentTo) {
      return;
    }

    column.setFilterValue(val);
    const utcFrom = hasFrom ? formatDateToUtcStartOfDay(trimmedFrom) : undefined;
    const utcTo = hasTo ? formatDateToUtcEndOfDay(trimmedTo) : undefined;

    onFilterSubmit?.(
      column.id,
      utcFrom,
      utcTo,
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
    <div className="flex flex-col gap-1.5 col-span-full w-full">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all shadow-sm">
          <span className="text-gray-400 font-normal">Từ:</span>
          <DateDisplayPicker
            value={fromDate}
            onChange={handleFromChange}
            placeholder="dd/mm/yyyy"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all shadow-sm">
          <span className="text-gray-400 font-normal">Đến:</span>
          <DateDisplayPicker
            value={toDate}
            onChange={handleToChange}
            placeholder="dd/mm/yyyy"
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


export function ColumnMultiSelectFilterInput<T>({
  column,
  label,
  options,
  onFilterSubmit,
}: {
  column: TanstackColumn<T, unknown>;
  label: string;
  options: { label: string; value: string | number | boolean }[];
  onFilterSubmit?: (
    attribute: string,
    value: unknown,
    toDate?: string,
  ) => void;
}) {
  const filterValue = column.getFilterValue();
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
    <div className="flex flex-col gap-1.5 col-span-full w-full">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="flex flex-wrap gap-1.5 w-full">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              type="button"
              key={String(opt.value)}
              onClick={() => toggle(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                active
                  ? "bg-primary/10 border-primary/30 text-primary font-semibold shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {active && <Check size={12} className="stroke-[2.5]" />}
              <span>{opt.label}</span>
            </button>
          );
        })}
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
    return (
      <ColumnMultiSelectFilterInput
        column={column}
        label={label}
        options={options}
        onFilterSubmit={onFilterSubmit}
      />
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
