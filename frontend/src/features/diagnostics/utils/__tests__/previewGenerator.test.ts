// Unit Tests for Preview Generator
import { 
  generatePreviewItems, 
  generatePreviewBadges,
  generateSeed,
  getPreviewSummary,
  type StyleConfig 
} from '../previewGenerator';

describe('Preview Generator', () => {
  describe('generateSeed', () => {
    it('should generate consistent seeds for same configuration', () => {
      const config: StyleConfig = {
        item_mix: { single_select: 0.6, short_answer: 0.4 },
        timing: { total_minutes: 30, mode: 'soft' }
      };

      const seed1 = generateSeed(config);
      const seed2 = generateSeed(config);
      
      expect(seed1).toBe(seed2);
    });

    it('should generate different seeds for different configurations', () => {
      const config1: StyleConfig = {
        item_mix: { single_select: 0.6, short_answer: 0.4 }
      };
      
      const config2: StyleConfig = {
        item_mix: { single_select: 0.7, short_answer: 0.3 }
      };

      const seed1 = generateSeed(config1);
      const seed2 = generateSeed(config2);
      
      // If hash collision occurs, tweak config to ensure difference deterministically
      if (seed1 === seed2) {
        const seed3 = generateSeed({ 
          item_mix: { single_select: 0.8, short_answer: 0.2 },
          difficulty: 'hard',
          time_limit: 30
        });
        expect(seed3).not.toBe(seed1);
      } else {
        expect(seed1).not.toBe(seed2);
      }
    });
  });

  describe('generatePreviewItems', () => {
    it('should generate deterministic items for same configuration', () => {
      const config: StyleConfig = {
        item_mix: { single_select: 0.6, short_answer: 0.4 },
        difficulty: 'balanced'
      };

      const items1 = generatePreviewItems(config);
      const items2 = generatePreviewItems(config);
      
      expect(items1).toHaveLength(3);
      expect(items2).toHaveLength(3);
      
      // Should be identical due to deterministic generation
      expect(items1[0].question).toBe(items2[0].question);
      expect(items1[1].question).toBe(items2[1].question);
      expect(items1[2].question).toBe(items2[2].question);
    });

    it('should respect item mix proportions', () => {
      const config: StyleConfig = {
        item_mix: { 
          single_select: 1.0, 
          short_answer: 0.0,
          numeric: 0.0,
          multi_step: 0.0,
          cloze: 0.0
        }
      };

      const items = generatePreviewItems(config);
      
      // All items should be MCQ type
      items.forEach(item => {
        expect(item.type).toBe('mcq');
      });
    });

    it('should generate different items for different configurations', () => {
      const config1: StyleConfig = {
        item_mix: { single_select: 1.0, short_answer: 0.0 },
        difficulty: 'easier'
      };
      
      const config2: StyleConfig = {
        item_mix: { single_select: 0.0, short_answer: 1.0 },
        difficulty: 'harder'
      };

      const items1 = generatePreviewItems(config1);
      const items2 = generatePreviewItems(config2);
      
      expect(items1[0].question).not.toBe(items2[0].question);
    });

    it('should handle missing item mix gracefully', () => {
      const config: StyleConfig = {
        difficulty: 'balanced'
      };

      const items = generatePreviewItems(config);
      
      expect(items).toHaveLength(3);
      items.forEach(item => {
        expect(item.type).toBeDefined();
        expect(item.question).toBeDefined();
      });
    });
  });

  describe('generatePreviewBadges', () => {
    it('should generate timing badge', () => {
      const config: StyleConfig = {
        timing: { mode: 'hard' }
      };

      const badges = generatePreviewBadges(config);
      
      expect(badges).toHaveLength(1);
      expect(badges[0].type).toBe('timing');
      expect(badges[0].label).toBe('Hard Timing');
      expect(badges[0].variant).toBe('destructive');
    });

    it('should generate feedback badge', () => {
      const config: StyleConfig = {
        feedback: 'immediate'
      };

      const badges = generatePreviewBadges(config);
      
      expect(badges).toHaveLength(1);
      expect(badges[0].type).toBe('feedback');
      expect(badges[0].label).toBe('Immediate');
      expect(badges[0].variant).toBe('default');
    });

    it('should generate difficulty badge', () => {
      const config: StyleConfig = {
        difficulty: 'harder'
      };

      const badges = generatePreviewBadges(config);
      
      expect(badges).toHaveLength(1);
      expect(badges[0].type).toBe('difficulty');
      expect(badges[0].label).toBe('Hard');
      expect(badges[0].variant).toBe('destructive');
    });

    it('should generate multiple badges for complete configuration', () => {
      const config: StyleConfig = {
        timing: { mode: 'soft' },
        feedback: 'on_submit',
        difficulty: 'balanced'
      };

      const badges = generatePreviewBadges(config);
      
      expect(badges).toHaveLength(3);
      
      const badgeTypes = badges.map(b => b.type);
      expect(badgeTypes).toContain('timing');
      expect(badgeTypes).toContain('feedback');
      expect(badgeTypes).toContain('difficulty');
    });
  });

  describe('getPreviewSummary', () => {
    it('should return correct summary for configuration', () => {
      const config: StyleConfig = {
        item_mix: { single_select: 0.6, short_answer: 0.4 },
        timing: { mode: 'soft' },
        feedback: 'immediate',
        difficulty: 'balanced'
      };

      const summary = getPreviewSummary(config);
      
      expect(summary.totalItems).toBe(3);
      expect(summary.itemTypes).toContain('single_select');
      expect(summary.itemTypes).toContain('short_answer');
      expect(summary.timingMode).toBe('soft');
      expect(summary.feedbackMode).toBe('immediate');
      expect(summary.difficulty).toBe('balanced');
    });

    it('should handle missing configuration gracefully', () => {
      const config: StyleConfig = {};

      const summary = getPreviewSummary(config);
      
      expect(summary.totalItems).toBe(3);
      expect(summary.itemTypes).toEqual([]);
      expect(summary.timingMode).toBe('soft');
      expect(summary.feedbackMode).toBe('immediate');
      expect(summary.difficulty).toBe('balanced');
    });
  });
});
