import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TagSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: TagOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  multiple?: boolean;
  clearable?: boolean;
  size?: "sm" | "md";
  showCount?: boolean;
}

const sizeClasses = {
  sm: "h-7 px-2.5 text-xs gap-1",
  md: "h-9 px-3.5 text-sm gap-1.5",
};

const TagSelect: React.FC<TagSelectProps> = ({
  className,
  options,
  value: controlledValue,
  defaultValue = [],
  onChange,
  multiple = true,
  clearable = true,
  size = "md",
  showCount = false,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
  const value = controlledValue ?? internalValue;

  const setValue = React.useCallback(
    (nextValue: string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [controlledValue, onChange]
  );

  const handleToggle = React.useCallback(
    (optionValue: string) => {
      if (multiple) {
        const next = value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue];
        setValue(next);
      } else {
        const next = value.includes(optionValue) ? [] : [optionValue];
        setValue(next);
      }
    },
    [value, multiple, setValue]
  );

  const handleClear = React.useCallback(() => {
    setValue([]);
  }, [setValue]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className
      )}
      {...props}
    >
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={cn(
              "inline-flex items-center rounded-lg font-medium",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus-visible:ring-2",
              "focus-visible:ring-navy-500/40 focus-visible:ring-offset-2",
              sizeClasses[size],
              isSelected
                ? [
                    "bg-gradient-to-r from-navy-500 to-navy-600 text-white",
                    "shadow-sm shadow-navy-500/20",
                  ]
                : [
                    "bg-slate-100 text-slate-700",
                    "hover:bg-slate-200 hover:text-navy-800",
                  ]
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span className="truncate">{option.label}</span>
            {showCount && option.count !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-1.5 py-0.5",
                  "text-[10px] font-semibold leading-none",
                  isSelected ? "bg-white/20 text-white" : "bg-white text-slate-500"
                )}
              >
                {option.count}
              </span>
            )}
            {multiple && isSelected && (
              <Check className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
            )}
          </button>
        );
      })}
      {clearable && value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "inline-flex items-center rounded-lg text-slate-500",
            "hover:text-danger-600 hover:bg-danger-50",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2",
            "focus-visible:ring-danger-500/40 focus-visible:ring-offset-2",
            sizeClasses[size]
          )}
        >
          <X className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
          <span>清除</span>
        </button>
      )}
    </div>
  );
};
TagSelect.displayName = "TagSelect";

export { TagSelect };
