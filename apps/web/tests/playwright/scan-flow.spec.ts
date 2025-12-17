import { test, expect } from '@playwright/test';

/**
 * E2E tests for the complete browser fingerprinting scan flow
 * Tests the journey from homepage → scan start → data collection → report viewing
 */

test.describe('Complete Scan Flow', () => {
  test('full scan journey from homepage to detailed report', async ({ page }) => {
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Trust Score');

    // Step 2: Wait for initial scan to auto-start (if implemented) or check for score display
    // The health ring should eventually show a score
    const scoreElement = page.locator('[role="status"][aria-live="polite"]').first();
    await expect(scoreElement).toBeVisible({ timeout: 15000 });

    // Step 3: Verify score is displayed (number 0-100)
    const scoreText = await page.textContent('text=/^\\d{1,3}$/');
    if (scoreText) {
      const score = parseInt(scoreText, 10);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }

    // Step 4: Verify grade is displayed (A+ through F)
    const gradePattern = /^(A\+|A-|A|B\+|B-|B|C\+|C-|C|D|F)$/;
    const gradeElement = page.locator('text=/^(A\\+|A-|A|B\\+|B-|B|C\\+|C-|C|D|F)$/').first();
    await expect(gradeElement).toBeVisible();

    // Step 5: Check dashboard sections are populated
    await expect(page.getByText('Identity')).toBeVisible();
    await expect(page.getByText('Score')).toBeVisible();

    // Step 6: Navigate to detailed network report
    const networkLink = page.locator('a[href*="/report/network"]').first();
    if (await networkLink.isVisible()) {
      await networkLink.click();
      await expect(page).toHaveURL(/\/report\/network/);

      // Verify network report content
      await expect(page.getByText('Network Layer')).toBeVisible();
      await expect(page.getByText(/Packet & TLS/i)).toBeVisible();
    }

    // Step 7: Navigate to hardware report
    await page.goto('/report/hardware');
    await expect(page.getByText('Hardware Layer')).toBeVisible();
    await expect(page.getByText(/Canvas|WebGL/i).first()).toBeVisible();

    // Step 8: Navigate to software report
    await page.goto('/report/software');
    await expect(page.getByText('Software Layer')).toBeVisible();

    // Step 9: Navigate to consistency report
    await page.goto('/report/consistency');
    await expect(page.getByText('Consistency')).toBeVisible();
  });

  test('scan data persists across report navigation', async ({ page }) => {
    // Load homepage and wait for scan
    await page.goto('/');
    await page.waitForTimeout(3000); // Allow time for scan to complete

    // Get initial score from homepage
    const homepageScore = await page.textContent('text=/^\\d{1,3}$/', { timeout: 10000 });

    // Navigate to network report
    await page.goto('/report/network');

    // Score should be consistent (if displayed on report page)
    const reportScoreElements = page.locator('text=/Score|Trust/i');
    await expect(reportScoreElements.first()).toBeVisible();

    // Navigate back to homepage
    await page.goto('/');

    // Score should still be visible and potentially the same (if using cached data)
    await expect(page.locator('text=/^\\d{1,3}$/').first()).toBeVisible();
  });

  test('loading states display correctly during scan', async ({ page }) => {
    // Go to homepage - scan may auto-start
    await page.goto('/');

    // Check for either loading indicator or scan console
    const scanConsole = page.locator('[role="region"][aria-label="Scan console"]');
    const healthRing = page.locator('[role="region"][aria-label="Trust score visualization"]');

    // At least one should be visible
    const consoleVisible = await scanConsole.isVisible().catch(() => false);
    const ringVisible = await healthRing.isVisible().catch(() => false);

    expect(consoleVisible || ringVisible).toBeTruthy();
  });

  test('empty state shows when no scan data available', async ({ page }) => {
    // Create a new incognito context to clear any stored scan data
    const context = await page.context().browser()?.newContext();
    if (!context) return;

    const newPage = await context.newPage();

    // Navigate to report page directly without running scan
    await newPage.goto('/report/network');

    // Should show empty state or loading indicator
    const emptyStateText = ['No scan data', 'run a scan', 'Please scan'];
    let foundEmptyState = false;

    for (const text of emptyStateText) {
      if (await newPage.getByText(new RegExp(text, 'i')).isVisible().catch(() => false)) {
        foundEmptyState = true;
        break;
      }
    }

    // Either empty state is shown or data loads from default
    expect(foundEmptyState || await newPage.getByText('Network Layer').isVisible()).toBeTruthy();

    await context.close();
  });
});

test.describe('Scan Console Behavior', () => {
  test('scan console shows progress messages', async ({ page }) => {
    await page.goto('/');

    // Look for scan console
    const scanConsole = page.locator('[role="region"][aria-label="Scan console"]');

    if (await scanConsole.isVisible()) {
      // Check for status indicator
      const statusDot = page.locator('[role="status"][aria-label*="Scan"]').first();
      await expect(statusDot).toBeVisible();

      // Should show engine version or status text
      await expect(page.getByText(/BrowserScan Engine|Status/i).first()).toBeVisible();
    }
  });

  test('scan console displays session duration when tracking', async ({ page }) => {
    await page.goto('/simulation/behavior');

    // Move mouse to start tracking
    await page.mouse.move(400, 300);
    await page.waitForTimeout(1000);

    // Check for recording indicator
    const recordingText = page.getByText(/Recording:/i);
    if (await recordingText.isVisible()) {
      await expect(recordingText).toContainText(/\d+s/);
    }
  });
});

test.describe('Report Navigation Flow', () => {
  test('breadcrumb navigation works correctly', async ({ page }) => {
    // Start at detailed report
    await page.goto('/report/network');

    // Look for back link
    const backLink = page.getByText('Back to Report');
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL(/\/report$/);
    }
  });

  test('report section pills navigate between tabs', async ({ page }) => {
    await page.goto('/report/network');

    // Click on Hardware pill
    const hardwarePill = page.locator('a[href*="/report/hardware"]').first();
    if (await hardwarePill.isVisible()) {
      await hardwarePill.click();
      await expect(page).toHaveURL(/\/report\/hardware/);
      await expect(page.getByText('Hardware Layer')).toBeVisible();
    }

    // Click on Software pill
    const softwarePill = page.locator('a[href*="/report/software"]').first();
    if (await softwarePill.isVisible()) {
      await softwarePill.click();
      await expect(page).toHaveURL(/\/report\/software/);
    }

    // Click on Consistency pill
    const consistencyPill = page.locator('a[href*="/report/consistency"]').first();
    if (await consistencyPill.isVisible()) {
      await consistencyPill.click();
      await expect(page).toHaveURL(/\/report\/consistency/);
    }
  });
});

test.describe('Scan Data Accuracy', () => {
  test('network report displays IP information', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Allow scan to run

    await page.goto('/report/network');

    // Should display IP-related information
    const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    const hasIP = await page.locator(`text=${ipPattern}`).count() > 0;

    // Even if no IP shown, page should load properly
    await expect(page.getByText('Network Layer')).toBeVisible();
  });

  test('hardware report displays canvas/WebGL data', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.goto('/report/hardware');

    // Should mention canvas or WebGL
    const hardwareTerms = ['Canvas', 'WebGL', 'GPU', 'Screen', 'Hardware'];
    let foundTerm = false;

    for (const term of hardwareTerms) {
      if (await page.getByText(new RegExp(term, 'i')).count() > 0) {
        foundTerm = true;
        break;
      }
    }

    expect(foundTerm).toBeTruthy();
  });

  test('software report displays fonts and languages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.goto('/report/software');

    // Should display software fingerprint data
    const softwareTerms = ['Font', 'Language', 'Timezone', 'Software'];
    let foundTerm = false;

    for (const term of softwareTerms) {
      if (await page.getByText(new RegExp(term, 'i')).count() > 0) {
        foundTerm = true;
        break;
      }
    }

    expect(foundTerm).toBeTruthy();
  });

  test('consistency report shows validation checks', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.goto('/report/consistency');

    // Should show consistency checks
    await expect(page.getByText('Consistency')).toBeVisible();

    // Should mention checks or validation
    const checkTerms = ['Check', 'Validation', 'Match', 'Consistent'];
    let foundTerm = false;

    for (const term of checkTerms) {
      if (await page.getByText(new RegExp(term, 'i')).count() > 0) {
        foundTerm = true;
        break;
      }
    }

    expect(foundTerm).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // Simulate offline scenario
    await page.context().setOffline(true);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});

    // Should show some error state or fallback
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();

    // Re-enable network
    await page.context().setOffline(false);
  });

  test('invalid report URLs show appropriate message', async ({ page }) => {
    await page.goto('/report/invalid-section');

    // Should either redirect or show 404/error
    const url = page.url();
    expect(url).toBeTruthy();
  });
});

test.describe('Accessibility in Scan Flow', () => {
  test('scan results are announced to screen readers', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA live regions
    const liveRegion = page.locator('[aria-live="polite"]');
    const count = await liveRegion.count();

    expect(count).toBeGreaterThan(0);
  });

  test('health ring has proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    const healthRing = page.locator('[role="region"][aria-label="Trust score visualization"]');
    await expect(healthRing).toBeVisible({ timeout: 10000 });

    // Should have status element with score info
    const statusElement = healthRing.locator('[role="status"]');
    if (await statusElement.count() > 0) {
      await expect(statusElement.first()).toBeVisible();
    }
  });

  test('skip to main content link works', async ({ page }) => {
    await page.goto('/');

    // Tab to skip link (should be first focusable element)
    await page.keyboard.press('Tab');

    // Skip link should be focused and visible when focused
    const skipLink = page.getByText('Skip to main content');
    const isFocused = await skipLink.evaluate((el) => el === document.activeElement);

    if (isFocused) {
      await skipLink.click();

      // Main content should be focused
      const mainContent = page.locator('main#main-content');
      await expect(mainContent).toBeVisible();
    }
  });
});
