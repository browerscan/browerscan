import { test, expect } from '@playwright/test';

const serviceError = JSON.stringify({
  status: 'error',
  message: 'Service unavailable in test'
});

test.describe('Truthful report states', () => {
  test('does not substitute sample data when the live report fails', async ({ page }) => {
    await page.route('**/api/scan/latest', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: serviceError
    }));

    await page.goto('/');

    await expect(page.getByRole('alert', { name: 'Live scan unavailable' })).toBeVisible();
    await expect(page.getByText('64.32.13.210')).toHaveCount(0);
    await expect(page.getByText('82', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/all systems nominal/i)).toHaveCount(0);
  });

  test('shows sample values only after the user selects a labeled demo', async ({ page }) => {
    await page.route('**/api/scan/latest', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: serviceError
    }));

    await page.goto('/');
    await page.getByRole('button', { name: 'View labeled demo' }).click();

    await expect(page.getByRole('status', { name: 'Demo report' })).toBeVisible();
    await expect(page.getByText('64.32.13.210')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Share Link' })).toBeDisabled();
  });

  test('shows the same unavailable state on a detailed report', async ({ page }) => {
    await page.route('**/api/scan/latest', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: serviceError
    }));

    await page.goto('/report/network');

    await expect(page.getByRole('alert', { name: 'Live report unavailable' })).toBeVisible();
    await expect(page.getByText(/No sample data was substituted/i)).toBeVisible();
  });
});

test.describe('Truthful tool states', () => {
  test('keeps DNS unknown when no resolver-path evidence exists', async ({ page }) => {
    await page.route('**/api/tools/ip-lookup', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', data: { ip: '8.8.8.8' } })
    }));
    await page.route('https://api6.ipify.org/**', (route) => route.abort());

    await page.goto('/tools/leak-test');

    const dns = page.getByRole('region', { name: 'DNS leak result' });
    await expect(dns).toHaveAttribute('data-state', 'unknown');
    await expect(dns).toContainText('Resolver path not observed');
    await expect(dns).not.toContainText('Using encrypted DNS');

    const ipv6 = page.getByRole('region', { name: 'IPv6 connectivity result' });
    await expect(ipv6).toHaveAttribute('data-state', 'not-detected');
    await expect(ipv6).toContainText('does not prove VPN leak protection');
  });

  test('renders an IP intelligence assessment without port verdicts', async ({ page }) => {
    await page.route('**/api/tools/port-scan', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        data: {
          target_ip: '8.8.8.8',
          capability: 'network_exposure_assessment',
          tcp_scan_performed: false,
          ports: [],
          assessment: {
            asn: 'AS15169',
            organization: 'Google LLC',
            country: 'United States',
            is_hosting: false,
            is_proxy: false,
            is_vpn: false,
            is_tor: false,
            risk_score: 12
          },
          note: 'No TCP connection was attempted.'
        }
      })
    }));

    await page.goto('/tools/port-scan');
    await page.getByRole('button', { name: 'Assess network' }).click();

    const result = page.getByTestId('network-exposure-result');
    await expect(result).toContainText('Google LLC');
    await expect(result).toContainText('TCP ports were not tested');
    await expect(page.getByText(/open port\(s\) detected/i)).toHaveCount(0);
    await expect(page.getByText(/^open$/i)).toHaveCount(0);
  });
});
