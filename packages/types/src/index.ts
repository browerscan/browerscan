export type ScanMeta = {
  scan_id: string;
  timestamp: number;
  version: string;
  server?: {
    colo?: string;
    http_protocol?: string;
    tls_version?: string;
    ray_id?: string;
    ip?: string;
  };
};

export type ScoreDeduction = {
  code: string;
  score: number;
  desc: string;
};

export type ScoreCard = {
  total: number;
  grade: string;
  verdict: string;
  deductions: ScoreDeduction[];
};

export type ScanIdentity = {
  ip: string;
  asn: string;
  location: string;
  browser: string;
  os: string;
  device: string;
};

export type NetworkRisk = {
  is_proxy: boolean;
  is_vpn: boolean;
  is_tor: boolean;
  fraud_score: number;
};

export type ProtocolFingerprints = {
  tls_ja3: string;
  tls_version: string;
  http_version: string;
  tcp_os_guess: string;
};

export type LeakStatus = 'SAFE' | 'LEAK' | 'WARN' | 'UNKNOWN';

export type LeakTelemetry = {
  webrtc: { status: LeakStatus; ip: string; region: string };
  dns: { status: LeakStatus; servers: string[] };
};

export type NetworkSection = {
  risk: NetworkRisk;
  protocols: ProtocolFingerprints;
  leaks: LeakTelemetry;
};

export type HardwareFingerprint = {
  canvas_hash: string;
  webgl_vendor: string;
  webgl_renderer: string;
  screen: string;
  concurrency: number;
  memory: number;
};

export type SoftwareFingerprint = {
  fonts_hash: string;
  timezone_name: string;
  languages: string[];
};

export type FingerprintSection = {
  hardware: HardwareFingerprint;
  software: SoftwareFingerprint;
};

export type ConsistencyCheck = {
  status: 'PASS' | 'FAIL' | 'WARN' | string;
  evidence: string;
};

export type ConsistencySection = {
  os_check: ConsistencyCheck;
  timezone_check: ConsistencyCheck;
  language_check: ConsistencyCheck;
};

export type ScanReport = {
  meta: ScanMeta;
  score: ScoreCard;
  identity: ScanIdentity;
  network: NetworkSection;
  fingerprint: FingerprintSection;
  consistency: ConsistencySection;
};

export type ApiResponse<T> = {
  status: 'ok';
  data: T;
};

/**
 * Error codes for API responses
 */
export type ApiErrorCode =
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'SERVICE_UNAVAILABLE';

/**
 * Standardized error response type
 */
export type ApiError = {
  status: 'error';
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

// ============================================
// AI Chat Types
// ============================================

/**
 * Role of a chat message
 */
export type ChatMessageRole = 'user' | 'assistant' | 'system';

/**
 * Individual chat message
 */
export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
  timestamp: number;
};

/**
 * Request payload for AI chat endpoint
 */
export type ChatRequest = {
  /** Optional scan ID to provide context */
  scan_id?: string;
  /** User's message */
  message: string;
  /** Conversation history (last N messages) */
  history: ChatMessage[];
};

/**
 * Response from AI chat endpoint
 */
export type ChatResponse = {
  status: 'ok' | 'error';
  data?: {
    /** AI's response */
    response: string;
    /** Tokens used (for monitoring) */
    tokens?: number;
  };
  error?: {
    code: ApiErrorCode;
    message: string;
  };
};

/**
 * Compact scan summary for LLM context
 */
export type ChatContextSummary = {
  scan_id: string;
  trust_score: number;
  grade: string;
  verdict: string;
  risk_flags: string[];
  leak_status: string[];
  consistency_issues: string[];
  fingerprint_highlights: string[];
};
