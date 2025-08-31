import * as React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export interface TagBadgeProps {
  tag: string;
  className?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const tagBadgeVariants = {
  size: {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  },
};

export function TagBadge({
  tag,
  className,
  variant = "secondary",
  size = "sm",
}: TagBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        tagBadgeVariants.size[size],
        "cursor-default select-none",
        className,
      )}
    >
      {tag}
    </Badge>
  );
}

export interface TagBadgeListProps {
  tags: string[];
  className?: string;
  maxTags?: number;
  showMore?: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function TagBadgeList({
  tags,
  className,
  maxTags = 5,
  showMore = true,
  variant = "secondary",
  size = "sm",
}: TagBadgeListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayTags.map((tag, index) => (
        <TagBadge
          key={`${tag}-${index}`}
          tag={tag}
          variant={variant}
          size={size}
        />
      ))}
      {showMore && remainingCount > 0 && (
        <Badge
          variant="outline"
          className={cn(
            tagBadgeVariants.size[size],
            "cursor-default select-none text-muted-foreground",
          )}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
