// E2E Tests for Style Picker Component
// Comprehensive tests covering the complete style selection flow

import { test, expect } from '@playwright/test';

test.describe('Style Picker E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the diagnostic creation page
    await page.goto('/projects/test-project/diagnostics/new');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="create-diagnostic-wizard"]');
  });

  test('should complete full style selection flow', async ({ page }) => {
    // Step 1: Fill basic settings
    await page.fill('[data-testid="topic-input"]', 'Thermodynamics Fundamentals');
    await page.selectOption('[data-testid="delivery-mode-select"]', 'DEFERRED_FEEDBACK');
    await page.selectOption('[data-testid="max-questions-select"]', '5');
    await page.click('[data-testid="next-button"]');

    // Step 2: Select a preset style
    await page.waitForSelector('[data-testid="style-picker"]');
    await page.click('[data-testid="preset-card-mcq_quiz"]');
    
    // Verify preset is selected
    await expect(page.locator('[data-testid="preset-card-mcq_quiz"]')).toHaveClass(/ring-blue-500/);
    await expect(page.locator('[data-testid="selected-badge"]')).toBeVisible();

    // Step 3: Open advanced configuration
    await page.check('[data-testid="advanced-checkbox"]');
    await page.waitForSelector('[data-testid="advanced-config"]');

    // Modify timing settings
    await page.fill('[data-testid="total-time-input"]', '20');
    await page.fill('[data-testid="per-item-time-input"]', '90');
    
    // Change feedback mode
    await page.selectOption('[data-testid="feedback-mode-select"]', 'on_submit');
    
    // Enable hints
    await page.check('[data-testid="hints-checkbox"]');

    // Step 4: Test validation and autofix
    // Create an invalid configuration (item mix doesn't sum to 1.0)
    await page.evaluate(() => {
      // Simulate invalid item mix
      const event = new CustomEvent('config-change', {
        detail: {
          item_mix: { single_select: 0.5, short_answer: 0.3 } // Sums to 0.8
        }
      });
      window.dispatchEvent(event);
    });

    // Wait for validation issues to appear
    await page.waitForSelector('[data-testid="validation-issue"]');
    
    // Verify validation issue is shown
    await expect(page.locator('[data-testid="validation-issue"]')).toContainText('Item mix sums to 0.80');
    
    // Apply autofix
    await page.click('[data-testid="apply-fix-button"]');
    
    // Verify fix was applied
    await expect(page.locator('[data-testid="validation-issue"]')).not.toBeVisible();

    // Step 5: Test preview functionality
    await page.click('[data-testid="show-preview-button"]');
    await page.waitForSelector('[data-testid="preview-items"]');
    
    // Verify preview items are generated
    const previewItems = page.locator('[data-testid="preview-item"]');
    await expect(previewItems).toHaveCount(3);
    
    // Verify preview badges
    await expect(page.locator('[data-testid="preview-badge"]')).toHaveCount(3);
    
    // Verify preview shows correct configuration
    await expect(page.locator('[data-testid="preview-summary"]')).toContainText('Timing: 20m total');
    await expect(page.locator('[data-testid="preview-summary"]')).toContainText('Feedback: on_submit');

    // Step 6: Proceed to review
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="review-step"]');
    
    // Verify review shows selected style and overrides
    await expect(page.locator('[data-testid="review-content"]')).toContainText('Test Style: mcq_quiz');
    await expect(page.locator('[data-testid="review-content"]')).toContainText('Timing: 20m total');
    await expect(page.locator('[data-testid="review-content"]')).toContainText('Feedback: on_submit');
    await expect(page.locator('[data-testid="review-content"]')).toContainText('Hints: Yes');

    // Step 7: Create diagnostic
    await page.click('[data-testid="create-diagnostic-button"]');
    
    // Wait for success
    await page.waitForSelector('[data-testid="success-message"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Diagnostic created successfully');
  });

  test('should handle preset switching correctly', async ({ page }) => {
    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Select first preset
    await page.click('[data-testid="preset-card-mcq_quiz"]');
    await expect(page.locator('[data-testid="preset-card-mcq_quiz"]')).toHaveClass(/ring-blue-500/);

    // Switch to second preset
    await page.click('[data-testid="preset-card-mixed_checkpoint"]');
    await expect(page.locator('[data-testid="preset-card-mixed_checkpoint"]')).toHaveClass(/ring-blue-500/);
    await expect(page.locator('[data-testid="preset-card-mcq_quiz"]')).not.toHaveClass(/ring-blue-500/);

    // Verify configuration changed
    await page.check('[data-testid="advanced-checkbox"]');
    await expect(page.locator('[data-testid="feedback-mode-select"]')).toHaveValue('on_submit');
    await expect(page.locator('[data-testid="total-time-input"]')).toHaveValue('30');
  });

  test('should validate hard timing constraints', async ({ page }) => {
    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Select a preset
    await page.click('[data-testid="preset-card-mcq_quiz"]');
    
    // Open advanced configuration
    await page.check('[data-testid="advanced-checkbox"]');
    
    // Set hard timing mode
    await page.selectOption('[data-testid="timing-mode-select"]', 'hard');
    
    // Set invalid per-item time (< 5 seconds)
    await page.fill('[data-testid="per-item-time-input"]', '3');
    
    // Trigger validation
    await page.blur('[data-testid="per-item-time-input"]');
    
    // Verify validation error appears
    await page.waitForSelector('[data-testid="validation-error"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Hard timing requires ≥5 seconds per item');
    
    // Apply fix
    await page.click('[data-testid="apply-fix-button"]');
    
    // Verify fix was applied
    await expect(page.locator('[data-testid="per-item-time-input"]')).toHaveValue('60');
    await expect(page.locator('[data-testid="validation-error"]')).not.toBeVisible();
  });

  test('should handle end-only feedback constraint', async ({ page }) => {
    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Select a preset
    await page.click('[data-testid="preset-card-mcq_quiz"]');
    
    // Open advanced configuration
    await page.check('[data-testid="advanced-checkbox"]');
    
    // Set end-only feedback
    await page.selectOption('[data-testid="feedback-mode-select"]', 'end_only');
    
    // Enable hints (should trigger warning)
    await page.check('[data-testid="hints-checkbox"]');
    
    // Trigger validation
    await page.blur('[data-testid="hints-checkbox"]');
    
    // Verify validation warning appears
    await page.waitForSelector('[data-testid="validation-warning"]');
    await expect(page.locator('[data-testid="validation-warning"]')).toContainText('End-only feedback disables hints');
    
    // Apply fix
    await page.click('[data-testid="apply-fix-button"]');
    
    // Verify hints were disabled
    await expect(page.locator('[data-testid="hints-checkbox"]')).not.toBeChecked();
  });

  test('should generate deterministic preview', async ({ page }) => {
    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Select a preset
    await page.click('[data-testid="preset-card-mixed_checkpoint"]');
    
    // Open preview
    await page.click('[data-testid="show-preview-button"]');
    await page.waitForSelector('[data-testid="preview-items"]');
    
    // Get first preview
    const firstPreview = await page.locator('[data-testid="preview-item"]').first().textContent();
    
    // Close and reopen preview
    await page.click('[data-testid="hide-preview-button"]');
    await page.click('[data-testid="show-preview-button"]');
    await page.waitForSelector('[data-testid="preview-items"]');
    
    // Get second preview
    const secondPreview = await page.locator('[data-testid="preview-item"]').first().textContent();
    
    // Verify preview is deterministic (same configuration = same preview)
    expect(firstPreview).toBe(secondPreview);
  });

  test('should track analytics events', async ({ page }) => {
    // Set up analytics spy
    const analyticsEvents: any[] = [];
    await page.addInitScript(() => {
      const originalLog = console.log;
      (window as any).console.log = (...args: any[]) => {
        if (args[0]?.includes('[StyleAnalytics]')) {
          (window as any).analyticsEvents = (window as any).analyticsEvents || [];
          (window as any).analyticsEvents.push(args);
        }
        originalLog.apply(console, args);
      };
    });

    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Select a preset (should trigger style_selected event)
    await page.click('[data-testid="preset-card-mcq_quiz"]');
    
    // Open advanced configuration and modify settings
    await page.check('[data-testid="advanced-checkbox"]');
    await page.fill('[data-testid="total-time-input"]', '25');
    
    // Open preview (should trigger preview_opened event)
    await page.click('[data-testid="show-preview-button"]');
    
    // Get analytics events
    const events = await page.evaluate(() => (window as any).analyticsEvents || []);
    
    // Verify events were tracked
    expect(events.length).toBeGreaterThan(0);
    
    const eventTypes = events.map((event: any) => event[0]);
    expect(eventTypes.some((type: string) => type.includes('style_selected'))).toBeTruthy();
    expect(eventTypes.some((type: string) => type.includes('style_customized'))).toBeTruthy();
    expect(eventTypes.some((type: string) => type.includes('preview_opened'))).toBeTruthy();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus first preset
    await page.keyboard.press('Tab'); // Focus second preset
    await page.keyboard.press('Enter'); // Select second preset
    
    // Verify preset was selected
    await expect(page.locator('[data-testid="preset-card-mixed_checkpoint"]')).toHaveClass(/ring-blue-500/);
    
    // Test ESC key functionality
    await page.check('[data-testid="advanced-checkbox"]');
    await page.keyboard.press('Escape');
    
    // Verify advanced config is still open (ESC doesn't close it in this context)
    await expect(page.locator('[data-testid="advanced-config"]')).toBeVisible();
  });

  test('should handle accessibility requirements', async ({ page }) => {
    // Navigate to style picker step
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');

    // Check for proper ARIA labels
    await expect(page.locator('[data-testid="preset-card-mcq_quiz"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[data-testid="preset-card-mcq_quiz"]')).toHaveAttribute('aria-label');
    
    // Check for proper form labels
    await page.check('[data-testid="advanced-checkbox"]');
    await expect(page.locator('[data-testid="total-time-input"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="per-item-time-input"]')).toHaveAttribute('aria-label');
    
    // Check for proper button roles
    await expect(page.locator('[data-testid="show-preview-button"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[data-testid="apply-fix-button"]')).toHaveAttribute('role', 'button');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/diagnostic-sessions/', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Complete the flow
    await page.fill('[data-testid="topic-input"]', 'Test Topic');
    await page.click('[data-testid="next-button"]');
    await page.waitForSelector('[data-testid="style-picker"]');
    await page.click('[data-testid="preset-card-mcq_quiz"]');
    await page.click('[data-testid="next-button"]');
    await page.click('[data-testid="next-button"]');
    await page.click('[data-testid="create-diagnostic-button"]');
    
    // Verify error handling
    await page.waitForSelector('[data-testid="error-message"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to create diagnostic');
  });
});
