/**
 * WebGL Fingerprinting
 * Extracts GPU vendor/renderer information
 */

export interface WebGLFingerprint {
  vendor: string;
  renderer: string;
  version: string;
  shadingVersion: string;
  extensions: string[];
}

export async function getWebGLFingerprint(): Promise<WebGLFingerprint> {
  const result: WebGLFingerprint = {
    vendor: 'unknown',
    renderer: 'unknown',
    version: 'unknown',
    shadingVersion: 'unknown',
    extensions: []
  };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return { ...result, vendor: 'unsupported', renderer: 'unsupported' };
    }

    const webgl = gl as WebGLRenderingContext;

    // Get debug info extension for unmasked vendor/renderer
    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');

    if (debugInfo) {
      result.vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
      result.renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
    } else {
      // Fallback to masked values
      result.vendor = webgl.getParameter(webgl.VENDOR) || 'unknown';
      result.renderer = webgl.getParameter(webgl.RENDERER) || 'unknown';
    }

    // Get WebGL version info
    result.version = webgl.getParameter(webgl.VERSION) || 'unknown';
    result.shadingVersion = webgl.getParameter(webgl.SHADING_LANGUAGE_VERSION) || 'unknown';

    // Get extensions
    const extensions = webgl.getSupportedExtensions();
    result.extensions = extensions ? extensions.slice(0, 20) : [];

    return result;
  } catch (error) {
    console.error('WebGL fingerprint error:', error);
    return result;
  }
}

/**
 * Get WebGL2 specific info
 */
export async function getWebGL2Fingerprint(): Promise<{
  supported: boolean;
  maxTextureSize: number;
  maxViewportDims: number[];
}> {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
      return { supported: false, maxTextureSize: 0, maxViewportDims: [0, 0] };
    }

    return {
      supported: true,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0,
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [0, 0]
    };
  } catch {
    return { supported: false, maxTextureSize: 0, maxViewportDims: [0, 0] };
  }
}
