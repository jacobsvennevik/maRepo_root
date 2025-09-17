// Unit Tests for Style Validator
import { 
  validateConfig, 
  applyFixes, 
  getValidationSummary,
  hasCriticalErrors,
  validateField,
  type StyleConfig 
} from '../styleValidator';

describe('Style Validator', () => {
  describe('validateConfig', () => {
    it('should validate item mix normalization', () => {
      const config: StyleConfig = {
        item_mix: {
          single_select: 0.5,
          short_answer: 0.3
        }
      };

      const result = validateConfig(config);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('NORMALIZE_MIX');
      expect(result.issues[0].level).toBe('warning');
      expect(result.fixes).toHaveLength(1);
      expect(result.fixes[0].path).toBe('item_mix');
    });

    it('should validate hard timing constraints', () => {
      const config: StyleConfig = {
        timing: {
          mode: 'hard',
          per_item_seconds: 3
        }
      };

      const result = validateConfig(config);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('HARD_TIMING_MIN');
      expect(result.issues[0].level).toBe('error');
      expect(result.fixes[0].value).toBe(60);
    });

    it('should validate end-only feedback constraint', () => {
      const config: StyleConfig = {
        feedback: 'end_only',
        hints: true
      };

      const result = validateConfig(config);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('END_ONLY_NO_HINTS');
      expect(result.issues[0].level).toBe('warning');
      expect(result.fixes[0].value).toBe(false);
    });

    it('should pass valid configuration', () => {
      const config: StyleConfig = {
        item_mix: {
          single_select: 0.6,
          short_answer: 0.4
        },
        timing: {
          mode: 'soft',
          total_minutes: 30,
          per_item_seconds: 90
        },
        feedback: 'immediate',
        hints: false
      };

      const result = validateConfig(config);
      
      expect(result.issues).toHaveLength(0);
      expect(result.fixes).toHaveLength(0);
    });
  });

  describe('applyFixes', () => {
    it('should apply fixes to configuration', () => {
      const config: StyleConfig = {
        item_mix: {
          single_select: 0.5,
          short_answer: 0.3
        }
      };

      const fixes = [
        { path: 'item_mix', value: { single_select: 0.625, short_answer: 0.375 } }
      ];

      const result = applyFixes(config, fixes);
      
      expect(result.item_mix?.single_select).toBe(0.625);
      expect(result.item_mix?.short_answer).toBe(0.375);
    });

    it('should handle nested path fixes', () => {
      const config: StyleConfig = {
        timing: {
          mode: 'hard',
          per_item_seconds: 3
        }
      };

      const fixes = [
        { path: 'timing.per_item_seconds', value: 60 }
      ];

      const result = applyFixes(config, fixes);
      
      expect(result.timing?.per_item_seconds).toBe(60);
    });
  });

  describe('getValidationSummary', () => {
    it('should return correct summary counts', () => {
      const config: StyleConfig = {
        item_mix: { single_select: 0.5, short_answer: 0.3 },
        timing: { mode: 'hard', per_item_seconds: 3 },
        feedback: 'end_only',
        hints: true
      };

      const summary = getValidationSummary(config);
      
      expect(summary.errors).toBe(1);
      expect(summary.warnings).toBe(2);
      expect(summary.info).toBe(0);
      expect(summary.total).toBe(3);
    });
  });

  describe('hasCriticalErrors', () => {
    it('should return true for configurations with errors', () => {
      const config: StyleConfig = {
        timing: { mode: 'hard', per_item_seconds: 3 }
      };

      expect(hasCriticalErrors(config)).toBe(true);
    });

    it('should return false for configurations without errors', () => {
      const config: StyleConfig = {
        timing: { mode: 'soft', per_item_seconds: 60 }
      };

      expect(hasCriticalErrors(config)).toBe(false);
    });
  });

  describe('validateField', () => {
    it('should validate individual fields', () => {
      const config: StyleConfig = {
        timing: { mode: 'soft', per_item_seconds: 60 }
      };

      const issues = validateField(config, 'timing.per_item_seconds', 3);
      
      expect(issues).toHaveLength(0); // No issues for soft timing
    });
  });
});
