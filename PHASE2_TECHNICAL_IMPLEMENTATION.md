# 🔧 **Phase 2 Technical Implementation Guide**

## **📋 Overview**

This document provides specific technical implementation details for Phase 2 development, focusing on the frontend UI enhancement, mobile optimization, and advanced flashcards features.

## **🚀 Priority 1: Frontend UI Enhancement**

### **Student Diagnostic Interface Components**

#### **1. Diagnostic Dashboard Component**
```tsx
// frontend/src/app/diagnostics/components/diagnostic-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useDiagnosticSessions } from '@/hooks/use-diagnostic-sessions';
import { ProgressChart } from '@/components/ui/progress-chart';
import { ConfidenceGauge } from '@/components/ui/confidence-gauge';

interface DiagnosticDashboardProps {
  userId: string;
  projectId?: string;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  userId,
  projectId
}) => {
  const { sessions, loading, error } = useDiagnosticSessions(userId, projectId);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('week');

  if (loading) return <div>Loading diagnostic data...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Diagnostic Progress</h2>
        <TimeframeSelector 
          value={selectedTimeframe} 
          onChange={setSelectedTimeframe} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressChart data={sessions} timeframe={selectedTimeframe} />
        <ConfidenceGauge data={sessions} />
        <PerformanceMetrics data={sessions} />
      </div>
      
      <SessionHistory sessions={sessions} />
    </div>
  );
};
```

#### **2. Question Interface Components**
```tsx
// frontend/src/app/diagnostics/components/question-interface.tsx
import React, { useState, useEffect } from 'react';
import { MCQQuestion } from './mcq-question';
import { ShortAnswerQuestion } from './short-answer-question';
import { PrincipleQuestion } from './principle-question';

interface QuestionInterfaceProps {
  question: DiagnosticQuestion;
  onAnswer: (answer: DiagnosticResponse) => void;
  timeLimit?: number;
}

export const QuestionInterface: React.FC<QuestionInterfaceProps> = ({
  question,
  onAnswer,
  timeLimit
}) => {
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);

  useEffect(() => {
    if (timeLimit) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLimit]);

  const handleSubmit = (answer: any) => {
    const responseTime = (Date.now() - startTime) / 1000;
    onAnswer({
      ...answer,
      response_time_seconds: responseTime
    });
  };

  const renderQuestion = () => {
    switch (question.question_type) {
      case 'MCQ':
        return <MCQQuestion question={question} onSubmit={handleSubmit} />;
      case 'SHORT_ANSWER':
        return <ShortAnswerQuestion question={question} onSubmit={handleSubmit} />;
      case 'PRINCIPLE':
        return <PrincipleQuestion question={question} onSubmit={handleSubmit} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-4">
      {timeLimit && (
        <div className="text-sm text-gray-600">
          Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      )}
      {renderQuestion()}
    </div>
  );
};
```

### **Instructor Analytics Dashboard**

#### **Real-Time Analytics Panel**
```tsx
// frontend/src/app/instructor/components/analytics-dashboard.tsx
import React from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { ParticipationChart } from '@/components/charts/participation-chart';
import { PerformanceHeatmap } from '@/components/charts/performance-heatmap';
import { ExportTools } from '@/components/export/export-tools';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, refresh } = useAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Diagnostic Analytics</h2>
        <button 
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ParticipationChart data={analytics.participation} />
        <PerformanceHeatmap data={analytics.performance} />
      </div>
      
      <ExportTools data={analytics} />
    </div>
  );
};
```

## **📱 Priority 2: Mobile Optimization**

### **Touch Interface Optimization**

#### **Touch-Friendly Controls**
```tsx
// frontend/src/components/ui/touch-controls.tsx
import React from 'react';

interface TouchButtonProps {
  onPress: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  onPress,
  onLongPress,
  children,
  variant = 'primary',
  size = 'md'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handleTouchStart = () => {
    setIsPressed(true);
    if (onLongPress) {
      longPressTimer.current = setTimeout(onLongPress, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    onPress();
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    danger: 'bg-red-600 text-white'
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-medium
        transition-all duration-150
        active:scale-95
        touch-manipulation
        select-none
        ${isPressed ? 'shadow-inner' : 'shadow-md'}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </button>
  );
};
```

### **Performance Optimization**

#### **Lazy Loading Implementation**
```tsx
// frontend/src/hooks/use-lazy-loading.ts
import { useState, useEffect, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

export const useLazyLoading = <T>(
  items: T[],
  pageSize: number = 20,
  options: UseLazyLoadingOptions = {}
) => {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(() => {
    const nextItems = items.slice(0, currentPage * pageSize);
    setVisibleItems(nextItems);
    setHasMore(nextItems.length < items.length);
  }, [items, currentPage, pageSize]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const loadNextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  return {
    visibleItems,
    hasMore,
    loadNextPage,
    isLoading: false
  };
};
```

## **🗂️ Priority 3: Advanced Flashcards**

### **FSRS Algorithm Implementation**

#### **FSRS Algorithm Service**
```typescript
// frontend/src/lib/fsrs-algorithm.ts
export interface FSRSState {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: Date;
}

export class FSRSAlgorithm {
  private static readonly W = [
    1, 1, 5, 2.5, 4.5, 0.5, 4.5, 0.5, 0.2, 1.4, 0.3, 0.4, 0.3, 3.8, 2.6, 2.3
  ];

  static calculateNextReview(
    state: FSRSState,
    quality: number,
    currentTime: Date = new Date()
  ): FSRSState {
    const elapsed_days = (currentTime.getTime() - state.last_review.getTime()) / (1000 * 60 * 60 * 24);
    
    // FSRS algorithm implementation
    const retrievability = Math.exp(Math.log(0.9) * elapsed_days / state.stability);
    
    let newStability = state.stability;
    let newDifficulty = state.difficulty;
    
    if (quality >= 3) {
      // Successful recall
      const delta = Math.max(0.1, 1 - newDifficulty);
      newStability = newStability * (1 + delta * (quality - 3) * 0.1);
      newDifficulty = Math.max(1.3, newDifficulty - 0.1 + (quality - 3) * 0.05);
    } else {
      // Failed recall
      newStability = newStability * Math.pow(0.8, 1 - newDifficulty);
      newDifficulty = Math.min(10, newDifficulty + 0.1 + (quality - 2) * 0.1);
    }
    
    const scheduled_days = newStability * Math.log(0.9) / Math.log(0.5);
    
    return {
      ...state,
      stability: newStability,
      difficulty: newDifficulty,
      scheduled_days: Math.max(1, Math.round(scheduled_days)),
      reps: state.reps + 1,
      last_review: currentTime
    };
  }
}
```

### **Anki Export/Import**

#### **APKG Generation**
```typescript
// frontend/src/lib/anki-export.ts
import JSZip from 'jszip';

export interface AnkiCard {
  front: string;
  back: string;
  tags: string[];
  deck: string;
}

export class AnkiExporter {
  static async generateAPKG(cards: AnkiCard[], deckName: string): Promise<Blob> {
    const zip = new JSZip();
    
    // Create Anki collection structure
    const collection = {
      decks: {
        [deckName]: {
          name: deckName,
          desc: "",
          cards: [],
          newToday: [0, 0],
          revToday: [0, 0],
          timeToday: [0, 0],
          conf: 1,
          usn: 0,
          extendRev: 0,
          extendNew: 0,
          extendLrn: 0,
          collapsed: false,
          browserCollapsed: false,
          newCount: 0,
          lrnCount: 0,
          timeLimit: 0,
          revCount: 0,
          dynCount: 0,
          filtCount: 0
        }
      },
      notes: [],
      models: {
        "1": {
          name: "Basic",
          tags: [],
          did: 1,
          req": [[0, "all", [0]]],
          flds: [
            { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 12 },
            { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 12 }
          ],
          tmpls: [
            {
              name: "Card 1",
              ord: 0,
              qfmt: "{{Front}}",
              afmt: "{{Front}}\n\n<hr>\n\n{{Back}}",
              did: null,
              bafmt: "",
              bqfmt: "",
              bfont: "",
              bsize: 0
            }
          ]
        }
      }
    };
    
    // Add cards to collection
    cards.forEach((card, index) => {
      const noteId = Date.now() + index;
      collection.notes.push({
        id: noteId,
        guid: this.generateGuid(),
        mid: 1,
        mod: Math.floor(Date.now() / 1000),
        flds: [card.front, card.back],
        tags: card.tags.join(" "),
        flags: 0
      });
      
      collection.decks[deckName].cards.push({
        id: noteId,
        nid: noteId,
        did: 1,
        ord: 0,
        type: 0,
        queue: 0,
        due: 0,
        factor: 2500,
        ivl: 0,
        reps: 0,
        lapses: 0,
        left: 0,
        odue: 0,
        odid: 0,
        flags: 0,
        data: ""
      });
    });
    
    // Add collection to zip
    zip.file("collection.anki2", JSON.stringify(collection));
    
    // Generate and return APKG
    return await zip.generateAsync({ type: "blob" });
  }
  
  private static generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
```

## **🧪 Testing Strategy**

### **Component Testing**
```tsx
// frontend/src/app/diagnostics/components/__tests__/diagnostic-dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { DiagnosticDashboard } from '../diagnostic-dashboard';
import { useDiagnosticSessions } from '@/hooks/use-diagnostic-sessions';

jest.mock('@/hooks/use-diagnostic-sessions');

describe('DiagnosticDashboard', () => {
  const mockSessions = [
    { id: '1', title: 'Test Diagnostic', status: 'completed' }
  ];

  beforeEach(() => {
    (useDiagnosticSessions as jest.Mock).mockReturnValue({
      sessions: mockSessions,
      loading: false,
      error: null
    });
  });

  it('renders diagnostic progress title', () => {
    render(<DiagnosticDashboard userId="123" />);
    expect(screen.getByText('Diagnostic Progress')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (useDiagnosticSessions as jest.Mock).mockReturnValue({
      sessions: [],
      loading: true,
      error: null
    });
    
    render(<DiagnosticDashboard userId="123" />);
    expect(screen.getByText('Loading diagnostic data...')).toBeInTheDocument();
  });
});
```

## **🔧 Configuration & Setup**

### **Environment Variables**
```bash
# frontend/.env.local
NEXT_PUBLIC_ENABLE_DIAGNOSTICS=true
NEXT_PUBLIC_ENABLE_FSRS_ALGORITHM=true
NEXT_PUBLIC_ANKI_EXPORT_ENABLED=true
NEXT_PUBLIC_MOBILE_OPTIMIZATION=true
```

### **Feature Flags**
```typescript
// frontend/src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  DIAGNOSTICS: process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === 'true',
  FSRS_ALGORITHM: process.env.NEXT_PUBLIC_ENABLE_FSRS_ALGORITHM === 'true',
  ANKI_EXPORT: process.env.NEXT_PUBLIC_ANKI_EXPORT_ENABLED === 'true',
  MOBILE_OPTIMIZATION: process.env.NEXT_PUBLIC_MOBILE_OPTIMIZATION === 'true'
} as const;
```

## **📊 Performance Monitoring**

### **Performance Metrics**
```typescript
// frontend/src/lib/performance-metrics.ts
export const trackDiagnosticPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'diagnostic_performance', {
      metric_name: metric,
      value: value,
      timestamp: Date.now()
    });
  }
};

export const trackMobilePerformance = (action: string, duration: number) => {
  trackDiagnosticPerformance(`mobile_${action}`, duration);
};
```

---

## **🎯 Implementation Checklist**

### **Week 1-2: Frontend UI Enhancement**
- [ ] Create diagnostic dashboard component
- [ ] Implement question interface components
- [ ] Build instructor analytics dashboard
- [ ] Add export functionality
- [ ] Write component tests

### **Week 2-3: Mobile Optimization**
- [ ] Implement touch-friendly controls
- [ ] Add lazy loading for large datasets
- [ ] Optimize bundle size for mobile
- [ ] Test responsive design
- [ ] Performance testing on mobile devices

### **Week 3-4: Advanced Flashcards**
- [ ] Implement FSRS algorithm
- [ ] Add Anki export/import functionality
- [ ] Create algorithm comparison tools
- [ ] Update flashcard components
- [ ] Integration testing

### **Quality Assurance**
- [ ] Unit test coverage >90%
- [ ] E2E test coverage for critical paths
- [ ] Performance testing with Lighthouse
- [ ] Accessibility testing (WCAG AA)
- [ ] Mobile device testing

---

**🚀 Ready to implement Phase 2 features with this technical guide!**
