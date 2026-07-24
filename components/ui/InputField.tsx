import { useState, type InputHTMLAttributes } from "react";

type InputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  label: string;
  onChange: (value: string) => void;
  showPasswordToggle?: boolean;
};

export default function InputField({
  label,
  id,
  onChange,
  className = "",
  showPasswordToggle = false,
  type = "text",
  ...props
}: InputFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hasPasswordToggle = showPasswordToggle && type === "password";
  const inputType = hasPasswordToggle && passwordVisible ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm text-[#171717] font-medium"
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={inputType}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm text-black outline-none shadow-xs focus:border-gray-500 placeholder:text-gray-500 ${hasPasswordToggle ? "pr-12" : ""} ${className}`.trim()}
        />
        {hasPasswordToggle && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}
