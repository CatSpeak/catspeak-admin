import { Plus } from "lucide-react";
import { ADD_BLOCK_LABELS } from "../constants";

interface AddBlockRowProps {
  onAddBlock?: (type: string) => void;
}

const AddBlockRow = ({ onAddBlock }: AddBlockRowProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
    {ADD_BLOCK_LABELS.map((label) => (
      <button
        key={label}
        onClick={() => onAddBlock?.(label)}
        className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-lg bg-white shadow-sm hover:border-red-200 hover:shadow-md transition-all text-xs text-gray-500 font-medium"
      >
        <Plus size={14} className="text-red-500" />
        Add Block ({label})
      </button>
    ))}
  </div>
);

export default AddBlockRow;
