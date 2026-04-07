import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "flat" | "interactive";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "elevated", ...props }, ref) => {
    const baseStyles = "rounded-[1.5rem] p-6 overflow-hidden transition-all duration-300 ease-premium";
    
    const variants = {
      elevated: "bg-surface-container-lowest shadow-[var(--shadow-card)]",
      flat: "bg-surface-container-low border border-outline-variant/10",
      interactive: "bg-surface-container-lowest shadow-[var(--shadow-card)] cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1"
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
