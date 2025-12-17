/**
 * Simulation Service
 * Handles reCAPTCHA score simulation and behavioral telemetry analysis
 */

// ============================================
// Types
// ============================================

export interface RecaptchaSimulation {
  id: string;
  score: number;
  timestamp: number;
  ip_hash: string;
  action: string;
}

export interface BehaviorEvent {
  type: 'mouse' | 'click' | 'scroll' | 'keypress';
  timestamp: number;
  x?: number;
  y?: number;
  key?: string;
  velocity?: number;
}

export interface BehaviorSession {
  session_id: string;
  events: BehaviorEvent[];
  start_time: number;
  end_time: number;
}

export interface BehaviorAnalysis {
  session_id: string;
  timestamp: number;
  // Entropy metrics
  mouse_entropy: number;
  click_entropy: number;
  keyboard_entropy: number;
  scroll_entropy: number;
  // Pattern metrics
  avg_mouse_velocity: number;
  mouse_curvature_score: number;
  click_interval_variance: number;
  typing_rhythm_variance: number;
  // Bot detection
  bot_probability: number;
  human_probability: number;
  verdict: 'HUMAN' | 'BOT' | 'SUSPICIOUS' | 'UNKNOWN';
  // Detailed scores
  scores: {
    category: string;
    score: number;
    weight: number;
    evidence: string;
  }[];
}

// ============================================
// Shannon Entropy Calculator
// ============================================

function calculateEntropy(values: number[]): number {
  if (values.length === 0) return 0;

  // Count occurrences
  const counts = new Map<number, number>();
  for (const v of values) {
    const rounded = Math.round(v * 10) / 10; // Bucket to 0.1 precision
    counts.set(rounded, (counts.get(rounded) || 0) + 1);
  }

  // Calculate probabilities and entropy
  const total = values.length;
  let entropy = 0;

  for (const count of counts.values()) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

// ============================================
// Mouse Analysis
// ============================================

function analyzeMouseMovements(events: BehaviorEvent[]): {
  entropy: number;
  avgVelocity: number;
  curvatureScore: number;
} {
  const mouseEvents = events.filter(e => e.type === 'mouse' && e.x !== undefined && e.y !== undefined);

  if (mouseEvents.length < 3) {
    return { entropy: 0, avgVelocity: 0, curvatureScore: 0 };
  }

  // Calculate velocities between points
  const velocities: number[] = [];
  const angles: number[] = [];

  for (let i = 1; i < mouseEvents.length; i++) {
    const prev = mouseEvents[i - 1];
    const curr = mouseEvents[i];

    const dx = (curr.x ?? 0) - (prev.x ?? 0);
    const dy = (curr.y ?? 0) - (prev.y ?? 0);
    const dt = curr.timestamp - prev.timestamp;

    if (dt > 0) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      velocities.push(distance / dt);

      // Calculate angle for curvature
      const angle = Math.atan2(dy, dx);
      angles.push(angle);
    }
  }

  // Calculate angle changes (curvature)
  // Humans have smooth curves, bots often have straight lines or sharp turns
  let totalAngleChange = 0;
  for (let i = 1; i < angles.length; i++) {
    let delta = angles[i] - angles[i - 1];
    // Normalize to [-PI, PI]
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    totalAngleChange += Math.abs(delta);
  }

  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const entropy = calculateEntropy(velocities);

  // Curvature score: more angle changes = more human-like
  // Normalize to 0-100
  const avgAngleChange = angles.length > 1 ? totalAngleChange / (angles.length - 1) : 0;
  const curvatureScore = Math.min(100, avgAngleChange * 50);

  return { entropy, avgVelocity, curvatureScore };
}

// ============================================
// Click Analysis
// ============================================

function analyzeClicks(events: BehaviorEvent[]): {
  entropy: number;
  intervalVariance: number;
} {
  const clickEvents = events.filter(e => e.type === 'click');

  if (clickEvents.length < 2) {
    return { entropy: 0, intervalVariance: 0 };
  }

  // Calculate intervals between clicks
  const intervals: number[] = [];
  for (let i = 1; i < clickEvents.length; i++) {
    intervals.push(clickEvents[i].timestamp - clickEvents[i - 1].timestamp);
  }

  const entropy = calculateEntropy(intervals);

  // Calculate variance (bots have very consistent intervals)
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;

  return { entropy, intervalVariance: Math.sqrt(variance) };
}

// ============================================
// Keyboard Analysis
// ============================================

function analyzeKeyboard(events: BehaviorEvent[]): {
  entropy: number;
  rhythmVariance: number;
} {
  const keyEvents = events.filter(e => e.type === 'keypress');

  if (keyEvents.length < 2) {
    return { entropy: 0, rhythmVariance: 0 };
  }

  // Calculate key press intervals
  const intervals: number[] = [];
  for (let i = 1; i < keyEvents.length; i++) {
    intervals.push(keyEvents[i].timestamp - keyEvents[i - 1].timestamp);
  }

  const entropy = calculateEntropy(intervals);

  // Calculate rhythm variance
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;

  return { entropy, rhythmVariance: Math.sqrt(variance) };
}

// ============================================
// Scroll Analysis
// ============================================

function analyzeScroll(events: BehaviorEvent[]): {
  entropy: number;
} {
  const scrollEvents = events.filter(e => e.type === 'scroll' && e.velocity !== undefined);

  if (scrollEvents.length < 2) {
    return { entropy: 0 };
  }

  const velocities = scrollEvents.map(e => e.velocity ?? 0);
  const entropy = calculateEntropy(velocities);

  return { entropy };
}

// ============================================
// Main Analysis Function
// ============================================

export function analyzeBehavior(session: BehaviorSession): BehaviorAnalysis {
  const { events, session_id, start_time, end_time } = session;

  // Analyze each category
  const mouse = analyzeMouseMovements(events);
  const clicks = analyzeClicks(events);
  const keyboard = analyzeKeyboard(events);
  const scroll = analyzeScroll(events);

  // Build detailed scores
  const scores: BehaviorAnalysis['scores'] = [];

  // Mouse entropy score (higher is more human-like)
  const mouseEntropyScore = Math.min(100, mouse.entropy * 20);
  scores.push({
    category: 'Mouse Movement Entropy',
    score: mouseEntropyScore,
    weight: 0.25,
    evidence: `Entropy: ${mouse.entropy.toFixed(2)} bits`
  });

  // Mouse curvature score
  scores.push({
    category: 'Mouse Path Curvature',
    score: mouse.curvatureScore,
    weight: 0.15,
    evidence: `Curvature indicates ${mouse.curvatureScore > 30 ? 'natural' : 'linear'} movement`
  });

  // Click interval variance (higher variance = more human)
  const clickVarianceScore = Math.min(100, clicks.intervalVariance / 10);
  scores.push({
    category: 'Click Timing Variance',
    score: clickVarianceScore,
    weight: 0.20,
    evidence: `Variance: ${clicks.intervalVariance.toFixed(0)}ms`
  });

  // Keyboard rhythm variance
  const keyboardScore = Math.min(100, keyboard.rhythmVariance / 5);
  scores.push({
    category: 'Typing Rhythm',
    score: keyboardScore,
    weight: 0.20,
    evidence: `Rhythm variance: ${keyboard.rhythmVariance.toFixed(0)}ms`
  });

  // Scroll entropy
  const scrollScore = Math.min(100, scroll.entropy * 25);
  scores.push({
    category: 'Scroll Behavior',
    score: scrollScore,
    weight: 0.10,
    evidence: `Entropy: ${scroll.entropy.toFixed(2)} bits`
  });

  // Event count check (too few events is suspicious)
  const eventCountScore = Math.min(100, events.length / 2);
  scores.push({
    category: 'Interaction Depth',
    score: eventCountScore,
    weight: 0.10,
    evidence: `${events.length} events recorded`
  });

  // Calculate weighted average for human probability
  let humanProbability = 0;
  let totalWeight = 0;
  for (const s of scores) {
    humanProbability += s.score * s.weight;
    totalWeight += s.weight;
  }
  humanProbability = humanProbability / totalWeight;

  // Bot probability is inverse
  const botProbability = 100 - humanProbability;

  // Determine verdict
  let verdict: BehaviorAnalysis['verdict'];
  if (humanProbability >= 70) {
    verdict = 'HUMAN';
  } else if (humanProbability >= 40) {
    verdict = 'SUSPICIOUS';
  } else if (events.length < 5) {
    verdict = 'UNKNOWN';
  } else {
    verdict = 'BOT';
  }

  return {
    session_id,
    timestamp: Math.floor(Date.now() / 1000),
    mouse_entropy: mouse.entropy,
    click_entropy: clicks.entropy,
    keyboard_entropy: keyboard.entropy,
    scroll_entropy: scroll.entropy,
    avg_mouse_velocity: mouse.avgVelocity,
    mouse_curvature_score: mouse.curvatureScore,
    click_interval_variance: clicks.intervalVariance,
    typing_rhythm_variance: keyboard.rhythmVariance,
    bot_probability: Math.round(botProbability),
    human_probability: Math.round(humanProbability),
    verdict,
    scores
  };
}

// ============================================
// Hash Functions
// ============================================

export function hashIp(ip: string, salt: string): string {
  // Simple hash for IP anonymization
  let hash = 0;
  const str = ip + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function generateSessionId(): string {
  return crypto.randomUUID();
}
