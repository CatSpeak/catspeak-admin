import React from "react";
import Card from "../../../components/ui/Card";
import { Package, CheckCircle2, EyeOff, Archive, FileEdit } from "lucide-react";

interface PlanSummaryCardsProps {
  stats: {
    total: number;
    active: number;
    hidden: number;
    archived: number;
    draft: number;
  };
}

const PlanSummaryCards: React.FC<PlanSummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Total Plans</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Displaying</p>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
          <EyeOff className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Hidden</p>
          <p className="text-2xl font-bold text-gray-900">{stats.hidden}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
          <Archive className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Archived</p>
          <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <FileEdit className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Draft</p>
          <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
        </div>
      </Card>
    </div>
  );
};

export default PlanSummaryCards;
