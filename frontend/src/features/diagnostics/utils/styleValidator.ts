// Style Configuration Validator with Autofixes
// Implements the 3 core validation rules with automatic fixes

export interface ValidationIssue {
  path: string;
  code: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  fix?: {
    path: string;
    value: unknown;
  };
}

export interface ValidationResult {
  issues: ValidationIssue[];
  fixes: { path: string; value: unknown }[];
}

export interface StyleConfig {
  item_mix?: Record<string, number>;
  timing?: {
    total_minutes?: number;
    per_item_seconds?: number;
    mode?: 'none' | 'soft' | 'hard';
  };
  feedback?: 'immediate' | 'on_submit' | 'end_only' | 'tiered_hints';
  difficulty?: 'easier' | 'balanced' | 'harder';
  hints?: boolean;
}

/**
 * Validates style configuration and provides automatic fixes
 */
export function validateConfig(effectiveConfig: StyleConfig): ValidationResult {
  const issues: ValidationIssue[] = [];
  const fixes: { path: string; value: unknown }[] = [];

  // Rule 1: Mix normalization - item_mix numbers should sum to 1.0
  if (effectiveConfig.item_mix) {
    const sum = Object.values(effectiveConfig.item_mix).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      const normalizedMix = normalizeItemMix(effectiveConfig.item_mix);
      issues.push({
        path: 'item_mix',
        code: 'NORMALIZE_MIX',
        level: 'warning',
        message: `Item mix sums to ${sum.toFixed(2)}, should be 1.0`,
        fix: {
          path: 'item_mix',
          value: normalizedMix
        }
      });
      fixes.push({
        path: 'item_mix',
        value: normalizedMix
      });
    }
  }

  // Rule 2: Hard timing requires per-item seconds ≥ 5
  if (effectiveConfig.timing?.mode === 'hard' && effectiveConfig.timing?.per_item_seconds !== undefined) {
    if (effectiveConfig.timing.per_item_seconds < 5) {
      issues.push({
        path: 'timing.per_item_seconds',
        code: 'HARD_TIMING_MIN',
        level: 'error',
        message: 'Hard timing requires ≥5 seconds per item',
        fix: {
          path: 'timing.per_item_seconds',
          value: 60
        }
      });
      fixes.push({
        path: 'timing.per_item_seconds',
        value: 60
      });
    }
  }

  // Rule 3: End-only feedback disables hints
  if (effectiveConfig.feedback === 'end_only' && effectiveConfig.hints === true) {
    issues.push({
      path: 'hints',
      code: 'END_ONLY_NO_HINTS',
      level: 'warning',
      message: 'End-only feedback disables hints',
      fix: {
        path: 'hints',
        value: false
      }
    });
    fixes.push({
      path: 'hints',
      value: false
    });
  }

  // Additional validation rules for completeness
  validateTimingConsistency(effectiveConfig, issues, fixes);
  validateItemMixProportions(effectiveConfig, issues, fixes);

  return { issues, fixes };
}

/**
 * Applies fixes to a configuration object
 */
export function applyFixes(config: StyleConfig, fixes: { path: string; value: unknown }[]): StyleConfig {
  const result = { ...config };

  fixes.forEach(fix => {
    setNestedValue(result, fix.path, fix.value);
  });

  return result;
}

/**
 * Normalizes item mix to sum to 1.0
 */
function normalizeItemMix(itemMix: Record<string, number>): Record<string, number> {
  const sum = Object.values(itemMix).reduce((a, b) => a + b, 0);
  
  if (sum === 0) {
    // If all values are 0, distribute evenly
    const keys = Object.keys(itemMix);
    const normalized: Record<string, number> = {};
    keys.forEach(key => {
      normalized[key] = 1 / keys.length;
    });
    return normalized;
  }

  // Normalize by dividing by sum
  const normalized: Record<string, number> = {};
  Object.keys(itemMix).forEach(key => {
    normalized[key] = itemMix[key] / sum;
  });

  return normalized;
}

/**
 * Validates timing consistency
 */
function validateTimingConsistency(
  config: StyleConfig,
  issues: ValidationIssue[],
  fixes: { path: string; value: unknown }[]
) {
  if (config.timing?.total_minutes && config.timing?.per_item_seconds) {
    const totalSeconds = config.timing.total_minutes * 60;
    const estimatedItems = Math.floor(totalSeconds / config.timing.per_item_seconds);
    
    if (estimatedItems < 1) {
      issues.push({
        path: 'timing',
        code: 'TIMING_INCONSISTENT',
        level: 'warning',
        message: `Timing allows for ${estimatedItems} items, consider adjusting`,
        fix: {
          path: 'timing.per_item_seconds',
          value: Math.max(30, totalSeconds / 3) // Suggest 3 items minimum
        }
      });
    }
  }
}

/**
 * Validates item mix proportions are reasonable
 */
function validateItemMixProportions(
  config: StyleConfig,
  issues: ValidationIssue[],
  fixes: { path: string; value: unknown }[]
) {
  if (config.item_mix) {
    const proportions = Object.values(config.item_mix);
    const maxProportion = Math.max(...proportions);
    
    if (maxProportion > 0.95) {
      issues.push({
        path: 'item_mix',
        code: 'MIX_TOO_CONCENTRATED',
        level: 'info',
        message: 'Item mix is very concentrated on one type',
        fix: undefined // No automatic fix for this
      });
    }
  }
}

/**
 * Sets a nested value in an object using dot notation
 */
function setNestedValue(obj: any, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Gets a nested value from an object using dot notation
 */
export function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Validates a single field and returns issues
 */
export function validateField(
  config: StyleConfig,
  fieldPath: string,
  value: unknown
): ValidationIssue[] {
  const tempConfig = { ...config };
  setNestedValue(tempConfig, fieldPath, value);
  
  const result = validateConfig(tempConfig);
  return result.issues.filter(issue => issue.path === fieldPath);
}

/**
 * Checks if a configuration has any critical errors
 */
export function hasCriticalErrors(config: StyleConfig): boolean {
  const result = validateConfig(config);
  return result.issues.some(issue => issue.level === 'error');
}

/**
 * Gets a summary of validation issues by level
 */
export function getValidationSummary(config: StyleConfig): {
  errors: number;
  warnings: number;
  info: number;
  total: number;
} {
  const result = validateConfig(config);
  
  return {
    errors: result.issues.filter(i => i.level === 'error').length,
    warnings: result.issues.filter(i => i.level === 'warning').length,
    info: result.issues.filter(i => i.level === 'info').length,
    total: result.issues.length
  };
}
