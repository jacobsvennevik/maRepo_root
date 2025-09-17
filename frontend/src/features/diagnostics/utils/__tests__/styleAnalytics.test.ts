// Unit Tests for Analytics Wrapper
import styleAnalytics, { 
  trackStyleSelected, 
  trackStyleCustomized, 
  trackPreviewOpened,
  trackValidationTriggered,
  trackAutofixApplied 
} from '../styleAnalytics';

// Mock console.log to capture analytics events
const mockConsoleLog = jest.fn();
const originalConsoleLog = console.log;

beforeEach(() => {
  console.log = mockConsoleLog;
  styleAnalytics.clearEvents();
});

afterEach(() => {
  console.log = originalConsoleLog;
  jest.clearAllMocks();
});

describe('Style Analytics', () => {
  describe('trackStyleSelected', () => {
    it('should track style selection events', () => {
      trackStyleSelected('mcq_quiz', 'MCQ Quiz', 'preset');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] style_selected:',
        expect.objectContaining({
          style_id: 'mcq_quiz',
          preset_name: 'MCQ Quiz',
          source: 'preset'
        })
      );
    });

    it('should track custom style selection', () => {
      trackStyleSelected('custom', undefined, 'custom');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] style_selected:',
        expect.objectContaining({
          style_id: 'custom',
          source: 'custom'
        })
      );
    });
  });

  describe('trackStyleCustomized', () => {
    it('should track style customization events', () => {
      trackStyleCustomized('mcq_quiz', 'timing.total_minutes', 15, 20, 'total_minutes');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] style_customized:',
        expect.objectContaining({
          style_id: 'mcq_quiz',
          path: 'timing.total_minutes',
          from: 15,
          to: 20,
          field_name: 'total_minutes'
        })
      );
    });

    it('should handle missing field name', () => {
      trackStyleCustomized('mcq_quiz', 'timing.total_minutes', 15, 20);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] style_customized:',
        expect.objectContaining({
          field_name: 'total_minutes'
        })
      );
    });
  });

  describe('trackPreviewOpened', () => {
    it('should track preview opened events', () => {
      trackPreviewOpened('mcq_quiz', 3);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] preview_opened:',
        expect.objectContaining({
          style_id: 'mcq_quiz',
          preview_type: 'opened',
          item_count: 3
        })
      );
    });

    it('should use default item count', () => {
      trackPreviewOpened('mcq_quiz');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] preview_opened:',
        expect.objectContaining({
          item_count: 3
        })
      );
    });
  });

  describe('trackValidationTriggered', () => {
    it('should track validation events', () => {
      trackValidationTriggered('mcq_quiz', 2, true, false);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] validation_triggered:',
        expect.objectContaining({
          style_id: 'mcq_quiz',
          issue_count: 2,
          has_errors: true,
          has_warnings: false
        })
      );
    });
  });

  describe('trackAutofixApplied', () => {
    it('should track autofix application', () => {
      trackAutofixApplied('mcq_quiz', 2, ['item_mix', 'timing.per_item_seconds']);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[StyleAnalytics] autofix_applied:',
        expect.objectContaining({
          style_id: 'mcq_quiz',
          fix_count: 2,
          fixes: ['item_mix', 'timing.per_item_seconds']
        })
      );
    });
  });

  describe('StyleAnalytics class', () => {
    it('should store events internally', () => {
      styleAnalytics.styleSelected('test-style');
      
      const events = styleAnalytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('style_selected');
    });

    it('should filter events by type', () => {
      styleAnalytics.styleSelected('test-style');
      styleAnalytics.styleCustomized('test-style', 'path', 'from', 'to');
      
      const styleSelectedEvents = styleAnalytics.getEventsByType('style_selected');
      expect(styleSelectedEvents).toHaveLength(1);
      
      const styleCustomizedEvents = styleAnalytics.getEventsByType('style_customized');
      expect(styleCustomizedEvents).toHaveLength(1);
    });

    it('should provide analytics summary', () => {
      // Mock Date.now to return different timestamps
      const originalDateNow = Date.now;
      let timestamp = 1000;
      Date.now = jest.fn(() => timestamp++);
      
      styleAnalytics.styleSelected('test-style');
      styleAnalytics.styleCustomized('test-style', 'path', 'from', 'to');
      styleAnalytics.styleSelected('another-style');
      
      const summary = styleAnalytics.getSummary();
      
      expect(summary.totalEvents).toBe(3);
      expect(summary.eventTypes.style_selected).toBe(2);
      expect(summary.eventTypes.style_customized).toBe(1);
      expect(summary.timeRange.start).toBeGreaterThan(0);
      expect(summary.timeRange.end).toBeGreaterThan(summary.timeRange.start);
      
      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('should clear events', () => {
      styleAnalytics.styleSelected('test-style');
      expect(styleAnalytics.getEvents()).toHaveLength(1);
      
      styleAnalytics.clearEvents();
      expect(styleAnalytics.getEvents()).toHaveLength(0);
    });

    it('should respect enabled/disabled state', () => {
      styleAnalytics.setEnabled(false);
      styleAnalytics.styleSelected('test-style');
      
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(styleAnalytics.getEvents()).toHaveLength(0);
      
      styleAnalytics.setEnabled(true);
      styleAnalytics.styleSelected('test-style');
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(styleAnalytics.getEvents()).toHaveLength(1);
    });
  });
});
