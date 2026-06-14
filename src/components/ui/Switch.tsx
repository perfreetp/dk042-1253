import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  labelPosition?: "left" | "right";
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, labelPosition = "right", disabled, checked, onChange, ...props }, ref) => {
    const switchElement = (
      <label
        className={cn(
          "relative inline-flex items-center cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {labelPosition === "left" && label && (
          <span className="mr-3 text-sm font-medium text-navy-800 select-none">{label}</span>
        )}
        <span className="sr-only">Toggle switch</span>
        <span className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            {...props}
          />
          <span
            className={cn(
              "block w-11 h-6 rounded-full",
              "bg-slate-200 transition-all duration-300 ease-in-out",
              "peer-focus-visible:outline-none peer-focus-visible:ring-2",
              "peer-focus-visible:ring-navy-500/40 peer-focus-visible:ring-offset-2",
              "peer-checked:bg-gradient-to-r peer-checked:from-navy-500 peer-checked:to-cyan-500",
              "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
              "after:bg-white after:rounded-full after:h-5 after:w-5",
              "after:shadow-sm after:transition-all after:duration-300 after:ease-in-out",
              "peer-checked:after:translate-x-5",
              "peer-disabled:cursor-not-allowed"
            )}
          />
        </span>
        {labelPosition === "right" && label && (
          <span className="ml-3 text-sm font-medium text-navy-800 select-none">{label}</span>
        )}
      </label>
    );
    return switchElement;
  }
);
Switch.displayName = "Switch";

export { Switch };
