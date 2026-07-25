import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode; // ReactNode, not string — the register page needs links inside its label
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => (
    <label className="flex items-start gap-2 text-sm text-gray-600">
      <input
        ref={ref}
        type="checkbox"
        className={`mt-0.5 ${className}`}
        {...props}
      />
      {label}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";
