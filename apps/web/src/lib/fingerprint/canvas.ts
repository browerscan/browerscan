/**
 * Canvas Fingerprinting
 * Creates a unique hash based on canvas rendering differences
 */

export async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return 'unsupported';

    canvas.width = 280;
    canvas.height = 60;

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text with specific font rendering
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#069';
    ctx.font = '14px Arial';
    ctx.fillText('BrowserScan.org fingerprint test', 4, 17);

    // Different font
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18px Times New Roman';
    ctx.fillText('Canvas FP!', 4, 40);

    // Geometric shapes
    ctx.fillStyle = '#f09';
    ctx.beginPath();
    ctx.arc(200, 30, 20, 0, Math.PI * 2);
    ctx.fill();

    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 280, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(100, 45, 150, 10);

    // Get data URL and hash it
    const dataUrl = canvas.toDataURL('image/png');
    return hashString(dataUrl);
  } catch (error) {
    console.error('Canvas fingerprint error:', error);
    return 'error';
  }
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
