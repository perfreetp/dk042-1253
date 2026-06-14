import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  icon?: React.ReactNode;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const iconSizeClasses: Record<AvatarSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const avatarColors = [
  "from-navy-400 to-navy-600 text-white",
  "from-cyan-400 to-cyan-600 text-white",
  "from-gold-400 to-gold-600 text-white",
  "from-success-400 to-success-600 text-white",
];

const getAvatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "", fallback, size = "md", icon, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);
    const displayName = fallback || alt;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full",
          "ring-2 ring-white shadow-sm",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : displayName ? (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center font-semibold",
              "bg-gradient-to-br",
              getAvatarColor(displayName)
            )}
          >
            {getInitials(displayName)}
          </span>
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center",
              "bg-slate-100 text-slate-400"
            )}
          >
            {icon || <User className={cn(iconSizeClasses[size])} />}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
