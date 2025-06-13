'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical,
  Play,
  Copy,
  Share2,
  Trash2,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';
import PropTypes from 'prop-types';

interface MindMapCardProps {
  mindMap: {
    id: string;
    title: string;
    subject: string;
    nodeCount: number;
    lastEdited: string;
    status: string;
    color: string;
    bgColor: string;
    borderColor: string;
    progress: number;
    isAIGenerated: boolean;
    description?: string;
  };
  getSubjectIcon: (subject: string) => string;
  getStatusColor: (status: string) => string;
  onOpen?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Card component for displaying a single mind map in grid or timeline view.
 * @param {object} props
 * @param {object} props.mindMap - Mind map data object
 * @param {function} props.getSubjectIcon - Returns subject icon string
 * @param {function} props.getStatusColor - Returns status color string
 * @param {function} [props.onOpen] - Handler for opening the mind map
 * @param {function} [props.onDuplicate] - Handler for duplicating the mind map
 * @param {function} [props.onShare] - Handler for sharing the mind map
 * @param {function} [props.onDelete] - Handler for deleting the mind map
 */
export function MindMapCard({ 
  mindMap, 
  getSubjectIcon, 
  getStatusColor,
  onOpen,
  onDuplicate,
  onShare,
  onDelete 
}: MindMapCardProps) {
  return (
    <Card 
      className={`${mindMap.bgColor} ${mindMap.borderColor} border-2 hover:shadow-xl transition-all duration-500 cursor-pointer group`}
      onClick={() => onOpen?.(mindMap.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${mindMap.color} shadow-lg`}>
              <span className="text-white text-xl">{getSubjectIcon(mindMap.subject)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {mindMap.title}
              </h3>
              <Badge className={`${getStatusColor(mindMap.status)} text-xs mt-1`}>
                {mindMap.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onOpen?.(mindMap.id)}>
                <Play className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(mindMap.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(mindMap.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete?.(mindMap.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {mindMap.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{mindMap.description}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Progress</span>
            <span className="font-medium">{mindMap.progress}%</span>
          </div>
          <Progress 
            value={mindMap.progress} 
            className="h-2"
            indicatorClassName={`bg-gradient-to-r ${mindMap.color}`}
          />
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{mindMap.nodeCount} nodes</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{mindMap.lastEdited}</span>
            </div>
          </div>

          {mindMap.isAIGenerated && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Sparkles className="h-3 w-3" />
              <span>AI Generated</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

MindMapCard.propTypes = {
  mindMap: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    nodeCount: PropTypes.number.isRequired,
    lastEdited: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    isAIGenerated: PropTypes.bool.isRequired,
    description: PropTypes.string,
  }).isRequired,
  getSubjectIcon: PropTypes.func.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  onOpen: PropTypes.func,
  onDuplicate: PropTypes.func,
  onShare: PropTypes.func,
  onDelete: PropTypes.func,
}; 