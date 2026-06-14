import { InputFieldProps } from "@/types/input-field";

export default function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  autoComplete,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold tracking-widest text-gray-500 uppercase"
      >
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#BC002D] transition-colors duration-200">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full pl-10 pr-10 py-3.5 rounded-xl text-sm text-[#111111]
            bg-white/60 border border-gray-200
            placeholder:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-[#BC002D]/30 focus:border-[#BC002D]
            hover:border-gray-300
            transition-all duration-200
          "
        />
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
    </div>
  );
}
