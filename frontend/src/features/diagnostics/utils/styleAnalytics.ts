// Style Analytics Wrapper
// Lightweight analytics system for tracking style selection and customization

export interface StyleAnalyticsEvent {
  eventName: string;
  payload: Record<string, any>;
  timestamp: number;
}

export interface StyleSelectionEvent {
  style_id: string;
  preset_name?: string;
  source: 'preset' | 'custom';
}

export interface StyleCustomizationEvent {
  style_id: string;
  path: string;
  from: any;
  to: any;
  field_name: string;
}

export interface PreviewEvent {
  style_id: string;
  preview_type: 'opened' | 'regenerated';
  item_count: number;
}

/**
 * Lightweight analytics wrapper for style-related events
 */
class StyleAnalytics {
  private events: StyleAnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  constructor() {
    // Initialize with console logging by default
    this.isEnabled = true;
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Track a generic event
   */
  track(eventName: string, payload: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const now = Date.now();
    const event: StyleAnalyticsEvent = {
      eventName,
      payload,
      timestamp: now === 0 ? 1 : now
    };

    this.events.push(event);

    // Log to console (repo-native approach)
    console.log(`[StyleAnalytics] ${eventName}:`, payload);

    // Future: integrate with existing analytics system
    // this.sendToAnalytics(event);
  }

  /**
   * Track style selection
   */
  styleSelected(styleId: string, presetName?: string, source: 'preset' | 'custom' = 'preset'): void {
    const payload: StyleSelectionEvent = {
      style_id: styleId,
      preset_name: presetName,
      source
    };

    this.track('style_selected', payload);
  }

  /**
   * Track style customization
   */
  styleCustomized(
    styleId: string, 
    path: string, 
    from: any, 
    to: any, 
    fieldName?: string
  ): void {
    const payload: StyleCustomizationEvent = {
      style_id: styleId,
      path,
      from,
      to,
      field_name: fieldName || path.split('.').pop() || 'unknown'
    };

    this.track('style_customized', payload);
  }

  /**
   * Track preview interactions
   */
  previewOpened(styleId: string, itemCount: number = 3): void {
    const payload: PreviewEvent = {
      style_id: styleId,
      preview_type: 'opened',
      item_count: itemCount
    };

    this.track('preview_opened', payload);
  }

  /**
   * Track preview regeneration
   */
  previewRegenerated(styleId: string, itemCount: number = 3): void {
    const payload: PreviewEvent = {
      style_id: styleId,
      preview_type: 'regenerated',
      item_count: itemCount
    };

    this.track('preview_regenerated', payload);
  }

  /**
   * Track validation events
   */
  validationTriggered(
    styleId: string, 
    issueCount: number, 
    hasErrors: boolean, 
    hasWarnings: boolean
  ): void {
    this.track('validation_triggered', {
      style_id: styleId,
      issue_count: issueCount,
      has_errors: hasErrors,
      has_warnings: hasWarnings
    });
  }

  /**
   * Track autofix application
   */
  autofixApplied(styleId: string, fixCount: number, fixes: string[]): void {
    this.track('autofix_applied', {
      style_id: styleId,
      fix_count: fixCount,
      fixes
    });
  }

  /**
   * Track wizard navigation
   */
  wizardStepCompleted(stepName: string, styleId?: string): void {
    this.track('wizard_step_completed', {
      step_name: stepName,
      style_id: styleId
    });
  }

  /**
   * Track diagnostic creation with style
   */
  diagnosticCreatedWithStyle(
    styleId: string, 
    hasOverrides: boolean, 
    overrideCount: number
  ): void {
    this.track('diagnostic_created_with_style', {
      style_id: styleId,
      has_overrides: hasOverrides,
      override_count: overrideCount
    });
  }

  /**
   * Get all tracked events (for debugging)
   */
  getEvents(): StyleAnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(eventName: string): StyleAnalyticsEvent[] {
    return this.events.filter(event => event.eventName === eventName);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get analytics summary
   */
  getSummary(): {
    totalEvents: number;
    eventTypes: Record<string, number>;
    timeRange: { start: number; end: number };
  } {
    const eventTypes: Record<string, number> = {};
    
    this.events.forEach(event => {
      eventTypes[event.eventName] = (eventTypes[event.eventName] || 0) + 1;
    });

    const timestamps = this.events.map(e => e.timestamp);
    const timeRange = {
      start: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      end: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };

    return {
      totalEvents: this.events.length,
      eventTypes,
      timeRange
    };
  }

  /**
   * Future: Send events to external analytics service
   */
  private sendToAnalytics(event: StyleAnalyticsEvent): void {
    // This would integrate with existing analytics infrastructure
    // For now, we just log to console as specified in requirements
    
    // Example integration points:
    // - Google Analytics: gtag('event', event.eventName, event.payload)
    // - Mixpanel: mixpanel.track(event.eventName, event.payload)
    // - Custom analytics: analytics.track(event.eventName, event.payload)
  }
}

// Export singleton instance
export const styleAnalytics = new StyleAnalytics();

// Export convenience functions
export const trackStyleSelected = (styleId: string, presetName?: string, source?: 'preset' | 'custom') => {
  styleAnalytics.styleSelected(styleId, presetName, source);
};

export const trackStyleCustomized = (styleId: string, path: string, from: any, to: any, fieldName?: string) => {
  styleAnalytics.styleCustomized(styleId, path, from, to, fieldName);
};

export const trackPreviewOpened = (styleId: string, itemCount?: number) => {
  styleAnalytics.previewOpened(styleId, itemCount);
};

export const trackPreviewRegenerated = (styleId: string, itemCount?: number) => {
  styleAnalytics.previewRegenerated(styleId, itemCount);
};

export const trackValidationTriggered = (styleId: string, issueCount: number, hasErrors: boolean, hasWarnings: boolean) => {
  styleAnalytics.validationTriggered(styleId, issueCount, hasErrors, hasWarnings);
};

export const trackAutofixApplied = (styleId: string, fixCount: number, fixes: string[]) => {
  styleAnalytics.autofixApplied(styleId, fixCount, fixes);
};

export const trackWizardStepCompleted = (stepName: string, styleId?: string) => {
  styleAnalytics.wizardStepCompleted(stepName, styleId);
};

export const trackDiagnosticCreatedWithStyle = (styleId: string, hasOverrides: boolean, overrideCount: number) => {
  styleAnalytics.diagnosticCreatedWithStyle(styleId, hasOverrides, overrideCount);
};

// Export the main instance for advanced usage
export default styleAnalytics;
