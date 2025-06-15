'use client';

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Palette } from 'lucide-react';

export interface LayoutOption {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface LayoutSelectorProps {
  layouts: LayoutOption[];
  currentLayout: string;
  onLayoutChange: (layoutId: string) => void;
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  className?: string;
}

export function LayoutSelector({ 
  layouts, 
  currentLayout, 
  onLayoutChange, 
  position = 'bottom-right',
  className = ''
}: LayoutSelectorProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'top-left':
        return 'fixed top-6 left-6';
      case 'bottom-right':
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  return (
    <div className={`${getPositionClasses()} z-50 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
            size="lg"
          >
            <Palette className="h-5 w-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {layouts.map((layout) => (
            <DropdownMenuItem 
              key={layout.id}
              onClick={() => onLayoutChange(layout.id)}
              className={currentLayout === layout.id ? 'bg-blue-50 text-blue-700' : ''}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: layout.color }}
                ></div>
                <div>
                  <div className="font-medium">{layout.name}</div>
                  {layout.description && (
                    <div className="text-xs text-gray-500">{layout.description}</div>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 