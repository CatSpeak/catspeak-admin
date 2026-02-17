import Card from "../../../components/ui/Card";

interface StatItemProps {
  label: string;
  count: number;
  color?: string;
}

const StatItem = ({ label, count, color = "#000" }: StatItemProps) => (
  <div className="flex items-center justify-between py-1.5">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">
      {count.toLocaleString()}
    </span>
  </div>
);

interface VietNamDetailCardProps {
  languageNative?: { vietnamese: number; english: number };
  languageLearning?: { chinese: number; english: number; japanese: number };
  topCombinations?: Array<{ languages: string; count: number }>;
}

export default function VietNamDetailCard({
  languageNative = { vietnamese: 3000, english: 451 },
  languageLearning = { chinese: 2000, english: 1000, japanese: 451 },
  topCombinations = [
    { languages: "Vietnamese - Japanese", count: 451 },
    { languages: "Vietnamese - Chinese", count: 1000 },
    { languages: "English - Chinese", count: 900 },
  ],
}: VietNamDetailCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Viet Nam Detail</h3>

      {/* Language Native Section */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Language native
        </h4>
        <div className="space-y-1">
          <StatItem
            label="Vietnamese"
            count={languageNative.vietnamese}
            color="#C8102E"
          />
          <StatItem
            label="English"
            count={languageNative.english}
            color="#C8102E"
          />
        </div>
      </div>

      {/* Language Learning Section */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Language learning
        </h4>
        <div className="space-y-1">
          <StatItem
            label="Chinese"
            count={languageLearning.chinese}
            color="#C8102E"
          />
          <StatItem
            label="English"
            count={languageLearning.english}
            color="#C8102E"
          />
          <StatItem
            label="Japanese"
            count={languageLearning.japanese}
            color="#C8102E"
          />
        </div>
      </div>

      {/* Top 3 Combinations Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Top 3 combinations
        </h4>
        <div className="space-y-1">
          {topCombinations.map((combo, idx) => (
            <StatItem
              key={idx}
              label={combo.languages}
              count={combo.count}
              color="#C8102E"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
