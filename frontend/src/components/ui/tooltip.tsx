"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative inline-block", className)}
      {...props}
    >
      {children}
    </div>
  );
});
Tooltip.displayName = "Tooltip";

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("TooltipTrigger must be used within a TooltipProvider");
  }

  return (
    <div
      ref={ref}
      className={cn("cursor-help", className)}
      onMouseEnter={() => context.setIsOpen(true)}
      onMouseLeave={() => context.setIsOpen(false)}
      onFocus={() => context.setIsOpen(true)}
      onBlur={() => context.setIsOpen(false)}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("TooltipContent must be used within a TooltipProvider");
  }

  if (!context.isOpen) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full",
        "after:content-[''] after:absolute after:top-full after:left-1/2 after:transform after:-translate-x-1/2",
        "after:border-4 after:border-transparent after:border-t-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }; 