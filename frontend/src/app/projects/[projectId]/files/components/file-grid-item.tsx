'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical,
  Share2,
  Trash2
} from 'lucide-react';
import { type FileItem } from './file-card';

interface FileGridItemProps {
  file: FileItem;
  getFileIcon: (type: string) => React.ReactNode;
  getFileTypeColor: (type: string) => string;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FileGridItem({ 
  file, 
  getFileIcon, 
  getFileTypeColor,
  onShare,
  onDelete
}: FileGridItemProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-4 text-center">
        <div className="relative">
          <div className={`mx-auto w-12 h-12 bg-gradient-to-r ${file.color} rounded-lg flex items-center justify-center mb-3`}>
            {getFileIcon(file.type)}
          </div>
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onShare(file.id)}>
                  <Share2 className="h-3 w-3 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onDelete(file.id)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <h4 className="font-medium text-slate-900 text-sm line-clamp-2 mb-2">
          {file.name}
        </h4>
        <Badge className={`${getFileTypeColor(file.type)} text-xs`}>
          {file.type.toUpperCase()}
        </Badge>
      </CardContent>
    </Card>
  );
} 