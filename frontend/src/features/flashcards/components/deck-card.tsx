"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Calendar,
  Clock,
  Edit3,
  MoreHorizontal,
  Play,
  Share2,
  Star,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlashcardSet } from '@/features/flashcards/types';
import { getDeckColor, formatDate, formatRelativeDate, getDueCardsColor } from './utils';
import type { DeckActionHandlers } from './types';

export interface DeckCardProps extends DeckActionHandlers {
  deck: FlashcardSet;
  variant?: 'default' | 'compact';
  layout?: 'grid' | 'list';
  projectId?: string;
  className?: string;
}

export function DeckCard({
  deck,
  variant = 'default',
  layout = 'grid',
  projectId,
  onEdit,
  onDelete,
  onShare,
  onToggleFavorite,
  className,
}: DeckCardProps) {
  const isCompact = variant === 'compact';
  const isListLayout = layout === 'list';

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'edit':
        onEdit?.(deck);
        break;
      case 'delete':
        onDelete?.(deck);
        break;
      case 'share':
        onShare?.(deck);
        break;
      case 'favorite':
        onToggleFavorite?.(deck);
        break;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Navigate to project-scoped deck carousel page
      const targetProjectId = projectId || deck.owner;
      window.location.href = `/projects/${targetProjectId}/flashcards/${deck.id}`;
    }
  };

  if (isListLayout) {
    return (
      <Card
        className={cn(
          'group hover:shadow-md transition-all duration-200',
          'border-l-4 border-l-primary/20 hover:border-l-primary',
          className
        )}
        tabIndex={0}
        role="button"
        aria-label={`Study deck: ${deck.title}. ${deck.study_stats?.total_cards || 0} cards, ${deck.study_stats?.due_cards || 0} due today`}
        onKeyDown={handleKeyDown}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left side - Main content */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {deck.title}
                  </h3>
                  {deck.tags?.includes('favorite') && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                
                {deck.description && (
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {deck.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{deck.study_stats?.total_cards || 0} cards</span>
                  </div>
                  
                  {deck.study_stats?.due_cards > 0 && (
                    <div className={cn('flex items-center space-x-1', getDueCardsColor(deck.study_stats.due_cards))}>
                      <Clock className="h-3 w-3" />
                      <span>{deck.study_stats.due_cards} due</span>
                    </div>
                  )}

                  {deck.study_stats?.next_review && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Last: {formatRelativeDate(deck.study_stats.next_review)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              >
                <Link href={`/projects/${projectId || deck.owner}/flashcards/${deck.id}`}>
                  <Play className="h-3 w-3 mr-1" />
                  Study
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    aria-label={`More actions for ${deck.title}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleQuickAction('edit')}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Deck
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickAction('share')}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Deck
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickAction('favorite')}>
                    <Star className="h-4 w-4 mr-2" />
                    {deck.tags?.includes('favorite') ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleQuickAction('delete')}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Deck
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid layout (default) - Simplified design matching the picture
  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200',
        'bg-white border border-gray-200',
        className
      )}
      tabIndex={0}
      role="button"
      aria-label={`Study deck: ${deck.title}. ${deck.study_stats?.total_cards || 0} cards, ${deck.study_stats?.due_cards || 0} due today`}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-8">
        {/* Top section with icon and actions */}
        <div className="flex items-start justify-between mb-6">
          {/* Icon */}
          <div className={cn("w-16 h-16 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm", getDeckColor(deck.id, 'icon'))}>
            <BookOpen className="h-8 w-8 text-white" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction('edit');
              }}
              aria-label={`Edit ${deck.title}`}
            >
              <Edit3 className="h-5 w-5 text-gray-700" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickAction('delete');
              }}
              aria-label={`Delete ${deck.title}`}
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-2xl mb-3">
          {deck.title}
        </h3>

        {/* Description */}
        {deck.description && (
          <p className="text-gray-600 text-base mb-6 line-clamp-2">
            {deck.description}
          </p>
        )}

        {/* Bottom section with card count and date */}
        <div className="flex items-center justify-between mb-6">
          <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700 px-3 py-1">
            {deck.study_stats?.total_cards || 0} cards
          </Badge>
          <span className="text-sm text-gray-500">
            {formatDate(deck.updated_at)}
          </span>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          className={cn("w-full bg-gradient-to-r text-white font-medium rounded-lg py-3 text-base", getDeckColor(deck.id, 'button'))}
        >
          <Link href={`/projects/${deck.owner}/flashcards/${deck.id}`}>
            Study Deck
            <ChevronRight className="h-5 w-5 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
