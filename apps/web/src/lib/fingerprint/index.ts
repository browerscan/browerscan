/**
 * Browser Fingerprint Collection Service
 * Hybrid approach: FingerprintJS + Custom collectors
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { getCanvasFingerprint } from './canvas';
import { getWebGLFingerprint } from './webgl';
import { getAudioFingerprint } from './audio';
import { getFontsFingerprint } from './fonts';
import { getWebRTCIPs } from './webrtc';

export interface BrowserFingerprint {
  visitor_id: string;
  canvas_hash: string;
  webgl_vendor: string;
  webgl_renderer: string;
  screen: string;
  concurrency: number;
  memory: number;
  fonts_hash: string;
  timezone: string;
  languages: string[];
  webrtc_ips: string[];
  dns_servers: string[];
  audio_hash: string;
  plugins: string[];
  is_webdriver: boolean;
  is_headless: boolean;
}

/**
 * Collect all browser fingerprints
 */
export async function collectFingerprint(): Promise<BrowserFingerprint> {
  // Initialize FingerprintJS
  const fp = await FingerprintJS.load();
  const fpResult = await fp.get();

  // Collect custom fingerprints in parallel
  const [canvas, webgl, audio, fonts, webrtcIps] = await Promise.all([
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAudioFingerprint(),
    getFontsFingerprint(),
    getWebRTCIPs()
  ]);

  // Get navigator data
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    webdriver?: boolean;
  };

  return {
    visitor_id: fpResult.visitorId,
    canvas_hash: canvas,
    webgl_vendor: webgl.vendor,
    webgl_renderer: webgl.renderer,
    screen: `${screen.width}x${screen.height}`,
    concurrency: nav.hardwareConcurrency || 0,
    memory: nav.deviceMemory || 0,
    fonts_hash: fonts,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: Array.from(nav.languages || [nav.language]).filter(Boolean),
    webrtc_ips: webrtcIps,
    dns_servers: [], // DNS detection requires external service
    audio_hash: audio,
    plugins: getPlugins(),
    is_webdriver: detectWebdriver(),
    is_headless: detectHeadless()
  };
}

/**
 * Get browser plugins
 */
function getPlugins(): string[] {
  try {
    const plugins = navigator.plugins;
    if (!plugins || plugins.length === 0) return [];

    return Array.from(plugins)
      .slice(0, 10)
      .map(p => p.name);
  } catch {
    return [];
  }
}

/**
 * Detect WebDriver (automation)
 */
function detectWebdriver(): boolean {
  const nav = navigator as Navigator & { webdriver?: boolean };

  // Check navigator.webdriver
  if (nav.webdriver === true) return true;

  // Check for automation properties
  const win = window as Window & {
    __webdriver_evaluate?: unknown;
    __selenium_evaluate?: unknown;
    __webdriver_script_function?: unknown;
    __webdriver_script_func?: unknown;
    __webdriver_script_fn?: unknown;
    __fxdriver_evaluate?: unknown;
    __driver_unwrapped?: unknown;
    __webdriver_unwrapped?: unknown;
    __driver_evaluate?: unknown;
    __selenium_unwrapped?: unknown;
    __fxdriver_unwrapped?: unknown;
    _phantom?: unknown;
    __nightmare?: unknown;
    _selenium?: unknown;
    callPhantom?: unknown;
    callSelenium?: unknown;
    domAutomation?: unknown;
    domAutomationController?: unknown;
  };

  const automationProps = [
    '__webdriver_evaluate',
    '__selenium_evaluate',
    '__webdriver_script_function',
    '__webdriver_script_func',
    '__webdriver_script_fn',
    '__fxdriver_evaluate',
    '__driver_unwrapped',
    '__webdriver_unwrapped',
    '__driver_evaluate',
    '__selenium_unwrapped',
    '__fxdriver_unwrapped',
    '_phantom',
    '__nightmare',
    '_selenium',
    'callPhantom',
    'callSelenium',
    'domAutomation',
    'domAutomationController'
  ];

  for (const prop of automationProps) {
    if (prop in win) return true;
  }

  // Check document for webdriver attribute
  if (document.documentElement.getAttribute('webdriver')) return true;

  return false;
}

/**
 * Detect headless browser
 */
function detectHeadless(): boolean {
  // Check for missing plugins (common in headless)
  if (navigator.plugins.length === 0) {
    // Could be headless, but also could be privacy settings
    // Check for other signs
  }

  // Check for missing languages
  if (!navigator.languages || navigator.languages.length === 0) return true;

  // Check for Chrome headless specific
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headlesschrome')) return true;

  // Check for PhantomJS
  if ('callPhantom' in window || '_phantom' in window) return true;

  // Check for zero screen dimensions
  if (screen.width === 0 || screen.height === 0) return true;

  // Check for unusual screen properties
  if (window.outerWidth === 0 && window.outerHeight === 0) return true;

  // Chrome-specific: check for missing chrome object
  if (ua.includes('chrome') && !('chrome' in window)) return true;

  return false;
}

/**
 * Start a scan and collect fingerprints
 */
export async function performScan(apiBase: string = ''): Promise<{
  scan_id: string;
  report: unknown;
}> {
  // Step 1: Start scan to get scan_id and server data
  const startResponse = await fetch(`${apiBase}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!startResponse.ok) {
    throw new Error('Failed to start scan');
  }

  const startData = await startResponse.json() as { data: { scan_id: string } };
  const { scan_id } = startData.data;

  // Step 2: Collect browser fingerprints
  const fingerprint = await collectFingerprint();

  // Step 3: Send fingerprints to server
  const collectResponse = await fetch(`${apiBase}/api/scan/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scan_id,
      canvas_hash: fingerprint.canvas_hash,
      webgl_vendor: fingerprint.webgl_vendor,
      webgl_renderer: fingerprint.webgl_renderer,
      screen: fingerprint.screen,
      concurrency: fingerprint.concurrency,
      memory: fingerprint.memory,
      fonts_hash: fingerprint.fonts_hash,
      timezone: fingerprint.timezone,
      languages: fingerprint.languages,
      webrtc_ips: fingerprint.webrtc_ips,
      dns_servers: fingerprint.dns_servers,
      audio_hash: fingerprint.audio_hash,
      plugins: fingerprint.plugins,
      is_webdriver: fingerprint.is_webdriver,
      is_headless: fingerprint.is_headless
    })
  });

  if (!collectResponse.ok) {
    throw new Error('Failed to collect fingerprints');
  }

  const collectData = await collectResponse.json() as { data: unknown };

  return {
    scan_id,
    report: collectData.data
  };
}
