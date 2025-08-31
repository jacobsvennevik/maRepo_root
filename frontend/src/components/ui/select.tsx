"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, children, disabled, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            className
          )}
          {...props}
        >
          {children}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DropdownMenuContent
        ref={ref}
        className={cn("w-full min-w-[8rem]", className)}
        {...props}
      >
        {children}
      </DropdownMenuContent>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className, disabled, ...props }, ref) => {
    return (
      <DropdownMenuItem
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </DropdownMenuItem>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef<HTMLSpanElement, { placeholder?: string }>(
  ({ placeholder, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className="block truncate"
        {...props}
      >
        {placeholder || "Select option..."}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};
