import { Globe } from "lucide-react";

interface LanguageStat {
  name: string;
  count: number;
  color?: string;
}

interface LanguageStatsProps {
  languages: LanguageStat[];
}

export default function LanguageStats({ languages }: LanguageStatsProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <Globe size={16} className="text-gray-600" />
        <h3 className="text-base font-bold text-gray-800">Languages</h3>
      </div>

      {/* Language List */}
      <div className="grid grid-cols-1 gap-3">
        {languages.map((lang, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{lang.name}:</span>
            <span
              className="text-sm font-semibold"
              style={{ color: lang.color || "#C8102E" }}
            >
              {lang.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
