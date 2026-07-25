import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// One place that decides what each variant/size actually looks like.
// Change "primary" here once, every primary button in the app updates.
const variantStyles: Record<Variant, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-800",
  outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
  ghost: "text-gray-500 hover:text-gray-900",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-3 text-sm rounded-lg",
  icon: "h-9 w-9 flex items-center justify-center rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";
