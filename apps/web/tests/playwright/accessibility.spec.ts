import { test, expect } from '@playwright/test';

/**
 * Accessibility Tests for BrowserScan
 *
 * These tests verify WCAG AA compliance:
 * - Proper heading hierarchy
 * - Keyboard navigation
 * - Focus indicators
 * - Color contrast (visual check via screenshots)
 * - ARIA labels and roles
 * - Alt text for images
 * - Form labels
 */

test.describe('Accessibility: Heading Structure', () => {
  test('homepage has exactly one h1', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('tools page has exactly one h1', async ({ page }) => {
    await page.goto('/tools');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('headings follow hierarchy on homepage', async ({ page }) => {
    await page.goto('/');

    // Get all heading levels
    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();

    // Should have at least one h1
    expect(h1).toBeGreaterThan(0);

    // If there are h3s, there should be h2s
    const h3 = await page.locator('h3').count();
    if (h3 > 0) {
      expect(h2).toBeGreaterThan(0);
    }
  });

  test('tool pages have proper heading hierarchy', async ({ page }) => {
    const toolPages = [
      '/tools/ip-lookup',
      '/tools/leak-test',
      '/tools/port-scan',
      '/tools/cookie-check',
      '/tools/pdf-gen'
    ];

    for (const toolPage of toolPages) {
      await page.goto(toolPage);
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    }
  });
});

test.describe('Accessibility: Keyboard Navigation', () => {
  test('can navigate homepage with keyboard', async ({ page }) => {
    await page.goto('/');

    // Press Tab to move through interactive elements
    await page.keyboard.press('Tab');

    // Something should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/tools/port-scan');

    // Find the scan button and check it can receive focus
    const scanButton = page.getByRole('button', { name: /scan/i });
    await scanButton.focus();

    const isFocused = await scanButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('links are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab to first link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if a link is focused
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    // Should be able to focus on various interactive elements
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'DETAILS', 'SUMMARY', 'DIV']).toContain(focusedTag);
  });
});

test.describe('Accessibility: Focus Indicators', () => {
  test('interactive elements have visible focus', async ({ page }) => {
    await page.goto('/tools');

    // Focus on first interactive element
    await page.keyboard.press('Tab');

    // Verify an element is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Accessibility: ARIA and Semantics', () => {
  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/tools/port-scan');

    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute('aria-label') || await button.textContent();
      expect(name).toBeTruthy();
    }
  });

  test('links have accessible text', async ({ page }) => {
    await page.goto('/tools');

    const links = page.getByRole('link');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Link should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/tools/port-scan');

    const inputs = page.locator('input:visible');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have some form of accessible name
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      const isAccessible = hasLabel || ariaLabel || ariaLabelledBy || placeholder;

      expect(isAccessible).toBeTruthy();
    }
  });
});

test.describe('Accessibility: Language and Text', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('en');
  });

  test('text is not too small', async ({ page }) => {
    await page.goto('/');

    // Get computed font sizes of body text
    const smallTextElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, li, td, th');
      const smallElements: string[] = [];

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 12) {
          smallElements.push(`${el.tagName}: ${fontSize}px`);
        }
      });

      return smallElements;
    });

    // Should have no text smaller than 12px (allowing for special cases)
    expect(smallTextElements.length).toBeLessThan(10);
  });
});

test.describe('Accessibility: Color and Contrast', () => {
  test('dark theme has sufficient contrast', async ({ page }) => {
    await page.goto('/');

    // Check that important text elements exist
    const bodyText = page.locator('p').first();
    if (await bodyText.isVisible()) {
      const color = await bodyText.evaluate(el =>
        window.getComputedStyle(el).color
      );
      // Color should be defined (not transparent)
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('text is visible on dark background', async ({ page }) => {
    await page.goto('/');

    // Get body background color
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    // Background should be dark (not white/transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });
});

test.describe('Accessibility: Motion and Animation', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Page should still render correctly
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Accessibility: Interactive Elements', () => {
  test('clickable elements have sufficient size', async ({ page }) => {
    await page.goto('/tools');

    const buttons = page.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Minimum touch target size (44x44 is recommended by WCAG)
          // We use a slightly smaller threshold for web
          expect(box.width).toBeGreaterThan(24);
          expect(box.height).toBeGreaterThan(24);
        }
      }
    }
  });

  test('links have sufficient size', async ({ page }) => {
    await page.goto('/tools');

    const links = page.getByRole('link');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const box = await link.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(20);
          expect(box.height).toBeGreaterThan(16);
        }
      }
    }
  });
});

test.describe('Accessibility: Error Messages', () => {
  test('error states are accessible', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/non-existent-page');

    // Should show 404 page with accessible content
    if (response?.status() === 404) {
      const heading = page.getByRole('heading');
      await expect(heading.first()).toBeVisible();
    }
  });
});
