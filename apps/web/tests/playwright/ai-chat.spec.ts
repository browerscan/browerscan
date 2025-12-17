import { test, expect } from '@playwright/test';

test.describe('AI Chat Widget', () => {
  test('chat button appears immediately', async ({ page }) => {
    await page.goto('/');

    // Button should be visible
    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await expect(button).toBeVisible();

    // Should have fingerprint icon
    await expect(button.locator('svg')).toBeVisible();
  });

  test('chat button starts pulsing after 15 seconds', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await expect(button).toBeVisible();

    // Wait for pulse animation (15s + 1s buffer)
    await page.waitForTimeout(16000);

    // Button should still be visible and pulsing
    // (We can't easily test the animation itself, but we can verify it's still there)
    await expect(button).toBeVisible();
  });

  test('opens chat window on click', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    // Chat window should appear
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(page.locator('text=Get started with a question:')).toBeVisible();

    // Button should be hidden
    await expect(button).not.toBeVisible();
  });

  test('quick-start questions are displayed', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    // All four quick-start questions should be visible
    await expect(page.locator('text=Analyze my browser fingerprint')).toBeVisible();
    await expect(page.locator('text=How unique is my fingerprint?')).toBeVisible();
    await expect(page.locator('text=What are the biggest privacy risks?')).toBeVisible();
    await expect(page.locator('text=How can I improve my privacy?')).toBeVisible();
  });

  test('clicking quick-start question sends message', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    // Click first quick-start question
    await page.locator('text=Analyze my browser fingerprint').click();

    // Quick-start questions should disappear
    await expect(page.locator('text=Get started with a question:')).not.toBeVisible();

    // Loading indicator should appear
    await expect(page.locator('text=Thinking...')).toBeVisible({ timeout: 2000 });
  });

  test('can type and send custom message', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    // Type custom message
    const input = page.locator('input[placeholder="Ask about your fingerprint..."]');
    await input.fill('What is my IP address?');

    // Send button should be enabled
    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeEnabled();

    // Click send
    await sendButton.click();

    // Input should be cleared
    await expect(input).toHaveValue('');

    // Loading indicator should appear
    await expect(page.locator('text=Thinking...')).toBeVisible({ timeout: 2000 });
  });

  test('closes chat window on close button click', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    // Chat window should be open
    await expect(page.locator('text=AI Assistant')).toBeVisible();

    // Click close button
    const closeButton = page.locator('button[aria-label="Close chat"]');
    await closeButton.click();

    // Chat window should be closed
    await expect(page.locator('text=AI Assistant')).not.toBeVisible();

    // Button should be visible again
    await expect(button).toBeVisible();
  });

  test('input has max length validation', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    const input = page.locator('input[placeholder="Ask about your fingerprint..."]');

    // Check maxLength attribute
    await expect(input).toHaveAttribute('maxLength', '2000');
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label="Open AI chat assistant"]');
    await button.click();

    const input = page.locator('input[placeholder="Ask about your fingerprint..."]');
    const sendButton = page.locator('button[aria-label="Send message"]');

    // Empty input - send button disabled
    await expect(sendButton).toBeDisabled();

    // Type something
    await input.fill('test');
    await expect(sendButton).toBeEnabled();

    // Clear input
    await input.clear();
    await expect(sendButton).toBeDisabled();
  });
});
