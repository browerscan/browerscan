/**
 * Font Fingerprinting
 * Detects installed fonts by measuring text rendering width
 */

// Common fonts to test
const TEST_FONTS = [
  // Windows fonts
  'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS',
  'Consolas', 'Courier New', 'Georgia', 'Impact', 'Lucida Console',
  'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype',
  'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  // macOS fonts
  'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Apple SD Gothic Neo',
  'Arial Hebrew', 'Avenir', 'Avenir Next', 'Baskerville', 'Big Caslon',
  'Brush Script MT', 'Chalkduster', 'Cochin', 'Copperplate', 'Didot',
  'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue',
  'Herculanum', 'Hoefler Text', 'Lucida Grande', 'Marker Felt', 'Menlo',
  'Monaco', 'Optima', 'Papyrus', 'Phosphate', 'PT Mono', 'PT Sans',
  'PT Serif', 'San Francisco', 'Skia', 'Snell Roundhand', 'SF Pro',
  // Linux fonts
  'Ubuntu', 'Ubuntu Mono', 'Liberation Mono', 'Liberation Sans',
  'Liberation Serif', 'DejaVu Sans', 'DejaVu Serif', 'DejaVu Sans Mono',
  'Droid Sans', 'Droid Serif', 'Droid Sans Mono', 'Noto Sans', 'Noto Serif',
  // CJK fonts
  'Microsoft YaHei', 'SimHei', 'SimSun', 'NSimSun', 'FangSong',
  'KaiTi', 'Hiragino Sans', 'Hiragino Kaku Gothic Pro', 'Meiryo',
  'MS Gothic', 'MS Mincho', 'Yu Gothic', 'Malgun Gothic'
];

const BASE_FONTS = ['monospace', 'sans-serif', 'serif'];
const TEST_STRING = 'mmmmmmmmmmlli';
const TEST_SIZE = '72px';

export async function getFontsFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return 'unsupported';

    // Get base widths
    const baseWidths: Record<string, number> = {};
    for (const font of BASE_FONTS) {
      ctx.font = `${TEST_SIZE} ${font}`;
      baseWidths[font] = ctx.measureText(TEST_STRING).width;
    }

    // Test each font
    const detectedFonts: string[] = [];

    for (const font of TEST_FONTS) {
      for (const baseFont of BASE_FONTS) {
        ctx.font = `${TEST_SIZE} '${font}', ${baseFont}`;
        const width = ctx.measureText(TEST_STRING).width;

        // If width differs from base, font is installed
        if (width !== baseWidths[baseFont]) {
          detectedFonts.push(font);
          break;
        }
      }
    }

    // Create hash from detected fonts
    const fontString = detectedFonts.sort().join(',');
    return hashString(fontString);
  } catch (error) {
    console.error('Font fingerprint error:', error);
    return 'error';
  }
}

/**
 * Get list of detected fonts (not just hash)
 */
export async function getDetectedFonts(): Promise<string[]> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return [];

    const baseWidths: Record<string, number> = {};
    for (const font of BASE_FONTS) {
      ctx.font = `${TEST_SIZE} ${font}`;
      baseWidths[font] = ctx.measureText(TEST_STRING).width;
    }

    const detectedFonts: string[] = [];

    for (const font of TEST_FONTS) {
      for (const baseFont of BASE_FONTS) {
        ctx.font = `${TEST_SIZE} '${font}', ${baseFont}`;
        const width = ctx.measureText(TEST_STRING).width;

        if (width !== baseWidths[baseFont]) {
          detectedFonts.push(font);
          break;
        }
      }
    }

    return detectedFonts;
  } catch {
    return [];
  }
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
