'use client';

import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  canSkip?: boolean;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onNext,
  onBack,
  onSkip,
  canGoNext,
  canGoBack,
  canSkip = false,
  enabled = true
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Prevent navigation when user is typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'Enter':
        event.preventDefault();
        if (canGoNext) {
          onNext();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (canGoBack) {
          onBack();
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (canSkip && onSkip) {
          onSkip();
        }
        break;
    }
  }, [enabled, onNext, onBack, onSkip, canGoNext, canGoBack, canSkip]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Expose methods for manual triggering
    triggerNext: () => canGoNext && onNext(),
    triggerBack: () => canGoBack && onBack(),
    triggerSkip: () => canSkip && onSkip && onSkip(),
  };
} 