"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LayoutToggleProps } from './types';

export function LayoutToggle({
  currentLayout,
  onLayoutChange,
  className,
}: LayoutToggleProps) {
  return (
    <div className={cn('flex items-center bg-gray-100 rounded-lg p-1', className)}>
      <Button
        variant={currentLayout === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLayoutChange('grid')}
        className={cn(
          'h-8 w-8 p-0 transition-all duration-200',
          currentLayout === 'grid'
            ? 'bg-white shadow-sm'
            : 'hover:bg-gray-200'
        )}
        aria-pressed={currentLayout === 'grid'}
        title="Grid view"
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      
      <Button
        variant={currentLayout === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLayoutChange('list')}
        className={cn(
          'h-8 w-8 p-0 transition-all duration-200',
          currentLayout === 'list'
            ? 'bg-white shadow-sm'
            : 'hover:bg-gray-200'
        )}
        aria-pressed={currentLayout === 'list'}
        title="List view"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}
