"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  Download,
  Sparkles,
  Layers,
  Network,
} from "lucide-react";

interface QuickActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "timeline" | "grid";
  onViewModeChange: (mode: "timeline" | "grid") => void;
  onImport?: () => void;
  onExport?: () => void;
  onAISuggestions?: () => void;
}

/**
 * Quick actions bar for search, import/export, AI, and view toggle.
 * @param {object} props
 * @param {string} props.searchTerm - Current search term
 * @param {function} props.onSearchChange - Handler for search input change
 * @param {string} props.viewMode - Current view mode ('timeline' or 'grid')
 * @param {function} props.onViewModeChange - Handler for view mode change
 * @param {function} [props.onImport] - Handler for import action
 * @param {function} [props.onExport] - Handler for export action
 * @param {function} [props.onAISuggestions] - Handler for AI suggestions
 */
export function QuickActions({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onImport,
  onExport,
  onAISuggestions,
}: QuickActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search mind maps..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onAISuggestions}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Help
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "timeline" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("timeline")}
        >
          <Layers className="h-4 w-4 mr-2" />
          Timeline
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
        >
          <Network className="h-4 w-4 mr-2" />
          Grid
        </Button>
      </div>
    </div>
  );
}
