import { test, expect } from '@playwright/test';

test.describe('BrowserScan Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders main heading and hero section', async ({ page }) => {
    // Check H1 is present
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Trust Score');
  });

  test('displays dashboard panels', async ({ page }) => {
    // Check for main dashboard sections
    await expect(page.getByText('Identity')).toBeVisible();
    await expect(page.getByText('Score')).toBeVisible();
  });

  test('health ring displays score', async ({ page }) => {
    // Check for score display (numerical value 0-100)
    const scoreText = page.locator('text=/\\d{1,3}(?:\\/100)?/');
    await expect(scoreText.first()).toBeVisible({ timeout: 10000 });
  });

  test('page has proper meta title', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('BrowserScan');
  });

  test('navigation links work', async ({ page }) => {
    // Check for navigation to tools
    const toolsLink = page.locator('a[href*="/tools"]').first();
    if (await toolsLink.isVisible()) {
      await toolsLink.click();
      await expect(page).toHaveURL(/\/tools/);
    }
  });
});

test.describe('Tools Index Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools');
  });

  test('displays tools heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows IP Lookup tool card', async ({ page }) => {
    await expect(page.getByText('IP Lookup')).toBeVisible();
  });

  test('shows Leak Test tool card', async ({ page }) => {
    await expect(page.getByText('Leak Test')).toBeVisible();
  });

  test('shows PDF Generator tool card', async ({ page }) => {
    await expect(page.getByText('PDF')).toBeVisible();
  });

  test('tool cards are clickable', async ({ page }) => {
    const ipLookupCard = page.locator('a[href*="/tools/ip-lookup"]').first();
    if (await ipLookupCard.isVisible()) {
      await ipLookupCard.click();
      await expect(page).toHaveURL(/\/tools\/ip-lookup/);
    }
  });
});

test.describe('IP Lookup Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/ip-lookup');
  });

  test('page loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('has back to tools link', async ({ page }) => {
    await expect(page.getByText('Back to Tools')).toBeVisible();
  });

  test('displays IP information', async ({ page }) => {
    // Should show IP-related content
    await expect(page.getByText(/IP/i).first()).toBeVisible();
  });
});

test.describe('Leak Test Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/leak-test');
  });

  test('page loads with leak test heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows WebRTC section', async ({ page }) => {
    await expect(page.getByText(/WebRTC/i).first()).toBeVisible();
  });

  test('shows DNS section', async ({ page }) => {
    await expect(page.getByText(/DNS/i).first()).toBeVisible();
  });
});

test.describe('Port Scanner Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/port-scan');
  });

  test('page loads with port scan heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows port list', async ({ page }) => {
    // Common ports should be visible
    await expect(page.getByText(/22|80|443/)).toBeVisible({ timeout: 5000 });
  });

  test('has scan button', async ({ page }) => {
    const scanButton = page.getByRole('button', { name: /scan/i });
    await expect(scanButton).toBeVisible();
  });
});

test.describe('Cookie Analyzer Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/cookie-check');
  });

  test('page loads with cookie heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows security tips section', async ({ page }) => {
    await expect(page.getByText(/security/i).first()).toBeVisible();
  });
});

test.describe('PDF Generator Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/pdf-gen');
  });

  test('page loads with PDF heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shows generate button', async ({ page }) => {
    const generateBtn = page.getByRole('button', { name: /generate|pdf/i });
    await expect(generateBtn).toBeVisible();
  });
});

test.describe('Simulation Pages', () => {
  test('behavior simulation page loads', async ({ page }) => {
    await page.goto('/simulation/behavior');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('recaptcha simulation page loads', async ({ page }) => {
    await page.goto('/simulation/recaptcha');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Should still show main content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('desktop viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('tools page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/tools');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});
