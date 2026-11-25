import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variantStyles: Record<string, string> = {
      default: "bg-[#1e3a8a] text-white shadow-2xs hover:bg-[#172554]",
      destructive: "bg-rose-600 text-white shadow-2xs hover:bg-rose-700",
      outline:
        "border border-slate-300 bg-white shadow-2xs hover:bg-slate-50 hover:text-slate-900",
      secondary: "bg-slate-100 text-slate-900 shadow-2xs hover:bg-slate-200",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
      link: "text-[#1e3a8a] underline-offset-4 hover:underline",
    };

    const sizeStyles: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
