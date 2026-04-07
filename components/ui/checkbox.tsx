import React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          className={`
            peer appearance-none h-6 w-6 shrink-0 rounded-full border-[1.5px] border-outline-variant/60
            bg-surface-container-lowest transition-all duration-300 ease-premium
            checked:border-primary checked:bg-primary hover:border-primary/60
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            ${className}
          `}
          {...props}
        />
        <Check 
          className="pointer-events-none absolute h-3.5 w-3.5 text-on-primary opacity-0 transition-all duration-300 ease-premium peer-checked:opacity-100 peer-checked:scale-100 scale-50" 
          strokeWidth={3}
        />
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
