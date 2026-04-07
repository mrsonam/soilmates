import React from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "terracotta";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles =
      "inline-flex font-display font-bold items-center justify-center tracking-tight transition-all duration-300 ease-premium outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]";

    const variants = {
      primary: "bg-primary text-on-primary rounded-full hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-primary/30",
      terracotta: "bg-terracotta text-white rounded-full hover:bg-terracotta/90 focus-visible:ring-4 focus-visible:ring-terracotta/30",
      secondary: "bg-surface-container-high text-on-surface rounded-full hover:bg-surface-container-highest focus-visible:ring-4 focus-visible:ring-surface-container-highest/50",
      ghost: "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full focus-visible:ring-4 focus-visible:ring-surface-container-low/50"
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-11 w-11"
    };

    return (
      <Comp
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
