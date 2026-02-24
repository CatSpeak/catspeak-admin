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
}: CharCountInputProps) => (
  <div className="relative">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border-b border-gray-200 pb-2 focus:outline-none focus:border-primary bg-transparent placeholder:text-gray-400 ${className}`}
      maxLength={maxLength}
    />
    <span className="absolute right-0 bottom-2 text-[10px] text-gray-400">
      {value.length}/{maxLength}
    </span>
  </div>
);

export default CharCountInput;
