interface CharCountInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  maxLength?: number;
  className?: string;
}

const CharCountInput = ({
  value,
  onChange,
  placeholder,
  maxLength = 100,
  className = "",
}: CharCountInputProps) => {
  const isNearLimit = value.length >= maxLength * 0.85;
  const isAtLimit = value.length >= maxLength;

  return (
    <div className="group relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent text-2xl md:text-3xl font-bold text-gray-900 tracking-tight placeholder:text-gray-300 focus:outline-none transition-all duration-200 pb-3 border-b border-transparent focus:border-gray-100 ${className}`}
        maxLength={maxLength}
      />
      <div className="absolute right-2 bottom-3 flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-200">
        <span
          className={`text-[10px] font-semibold tracking-wider tabular-nums px-1.5 py-0.5 rounded-full transition-colors ${isAtLimit
            ? "bg-red-50 text-red-600 font-bold"
            : isNearLimit
              ? "bg-amber-50 text-amber-600"
              : "bg-gray-50 text-gray-400"
            }`}
        >
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
};

export default CharCountInput;
