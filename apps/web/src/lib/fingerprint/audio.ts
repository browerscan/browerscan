/**
 * Audio Context Fingerprinting
 * Creates a unique hash based on audio processing differences
 */

export async function getAudioFingerprint(): Promise<string> {
  try {
    // Check for AudioContext support
    const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;

    if (!AudioContext) {
      return 'unsupported';
    }

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    // Configure oscillator
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    // Configure gain (mute the output)
    gainNode.gain.setValueAtTime(0, context.currentTime);

    // Connect nodes
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);

    // Start and stop quickly
    oscillator.start(0);

    // Wait a bit for audio processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get frequency data
    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    // Calculate hash from frequency data
    let hash = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      if (isFinite(frequencyData[i])) {
        hash = ((hash << 5) - hash) + Math.floor(frequencyData[i] * 100);
        hash = hash & hash;
      }
    }

    // Cleanup
    oscillator.stop();
    oscillator.disconnect();
    analyser.disconnect();
    scriptProcessor.disconnect();
    gainNode.disconnect();
    context.close();

    return Math.abs(hash).toString(16).padStart(8, '0');
  } catch (error) {
    console.error('Audio fingerprint error:', error);
    return 'error';
  }
}

/**
 * Get basic audio capabilities
 */
export function getAudioCapabilities(): {
  sampleRate: number;
  channelCount: number;
  state: string;
} {
  try {
    const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;

    if (!AudioContext) {
      return { sampleRate: 0, channelCount: 0, state: 'unsupported' };
    }

    const context = new AudioContext();
    const result = {
      sampleRate: context.sampleRate,
      channelCount: context.destination.maxChannelCount,
      state: context.state
    };

    context.close();
    return result;
  } catch {
    return { sampleRate: 0, channelCount: 0, state: 'error' };
  }
}
