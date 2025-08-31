import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  FileText,
  Book,
  Video,
} from "lucide-react";
import type { ReactNode } from "react";

interface StudyMaterialCardProps {
  title: string;
  type: string;
  progress?: number;
  lastReviewed?: string;
  tags?: string[];
  status: "In Progress" | "Completed" | "Not Started";
  icon?: ReactNode;
  description?: string;
  studyTime?: string;
  category?: string;
  timeAgo?: string;
  id: string;
  isExpanded?: boolean;
  hideExpansionButton?: boolean;
}

export function StudyMaterialCard({
  title,
  type,
  status,
  description = "Study material with AI-generated content to help you learn more effectively.",
  studyTime = "45 minutes study time",
  category = "General",
  timeAgo = "2h ago",
  id = "material-1",
  isExpanded = false,
  hideExpansionButton = false,
}: StudyMaterialCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  // Determine icon and background color based on type
  const getIconAndColor = () => {
    switch (type.toLowerCase()) {
      case "pdf":
        return {
          icon: <FileText className="h-6 w-6 text-white" />,
          bgColor: "bg-ocean-500",
        };
      case "video":
        return {
          icon: <Video className="h-6 w-6 text-white" />,
          bgColor: "bg-indigo-500",
        };
      case "course":
      case "tutorial":
        return {
          icon: <Book className="h-6 w-6 text-white" />,
          bgColor: "bg-emerald-500",
        };
      default:
        return {
          icon: <FileText className="h-6 w-6 text-white" />,
          bgColor: "bg-ocean-500",
        };
    }
  };

  const { icon, bgColor } = getIconAndColor();

  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded ${bgColor} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-slate-800">{title}</h3>
            <Badge
              className={`${
                status === "Completed"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-200 text-slate-700"
              } border-none text-xs px-2 py-0.5 rounded-md`}
            >
              {status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{studyTime}</p>
        </div>
        {!hideExpansionButton && (
          <button
            className="flex-shrink-0 rounded-full p-2 bg-slate-200 hover:bg-slate-300"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 ml-16 space-y-3">
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full px-3"
            >
              Self-paced
            </Badge>
            <Badge
              variant="outline"
              className="text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full px-3"
            >
              {type}
            </Badge>
          </div>

          <p className="text-sm text-slate-600">{description}</p>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
