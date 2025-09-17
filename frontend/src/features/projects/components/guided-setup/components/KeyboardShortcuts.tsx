'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsProps {
  className?: string;
}

export default function KeyboardShortcuts({ className }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: '→', description: 'Next step' },
    { key: '←', description: 'Previous step' },
    { key: 'Enter', description: 'Next step' },
    { key: 'Esc', description: 'Skip current step' },
  ];

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700"
      >
        <Keyboard className="w-4 h-4 mr-1" />
        Shortcuts
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Keyboard Shortcuts</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 