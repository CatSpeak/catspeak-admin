import React from "react";
import { Search, X, Filter } from "lucide-react";
import type { PlanFilters as FiltersType } from "../hooks/usePlans";

interface PlanFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
}

const PlanFilters: React.FC<PlanFiltersProps> = ({ filters, setFilters }) => {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.role !== "" ||
    filters.status !== undefined ||
    filters.type !== "";

  const clearFilters = () => {
    setFilters({
      search: "",
      role: "",
      status: undefined,
      type: "",
    });
  };

  return (
    <div className="p-4 rounded-xl bg-orange-50 border border-accent/20 space-y-3 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search plan name or code..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Role Select */}
        <select
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Roles</option>
          <option value="Learner">Learner</option>
          <option value="Teacher">Teacher</option>
          <option value="Club">Club</option>
          <option value="Business">Business</option>
        </select>

        {/* Status Select */}
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            status: e.target.value === "" ? undefined : e.target.value 
          }))}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Hidden">Hidden</option>
          <option value="Archived">Archived</option>
        </select>

        {/* Plan Type Select */}
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Types</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
          <option value="Lifetime">Lifetime</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg bg-white hover:border-red-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanFilters;
