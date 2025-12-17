/**
 * Zod Validation Schemas
 * Central validation for all API endpoints
 */

import { z } from 'zod';

// ============================================
// Scan Schemas
// ============================================

export const ClientFingerprintSchema = z.object({
  scan_id: z.string().uuid(),
  canvas_hash: z.string().optional().default('unknown'),
  webgl_vendor: z.string().optional().default('unknown'),
  webgl_renderer: z.string().optional().default('unknown'),
  screen: z.string().optional().default('unknown'),
  concurrency: z.number().int().min(0).max(128).optional().default(0),
  memory: z.number().min(0).max(1024).optional().default(0),
  fonts_hash: z.string().optional().default('unknown'),
  timezone: z.string().optional().default('unknown'),
  languages: z.array(z.string()).optional().default([]),
  webrtc_ips: z.array(z.string().ip()).optional().default([]),
  dns_servers: z.array(z.string()).optional().default([]),
  audio_hash: z.string().optional(),
  plugins: z.array(z.string()).optional(),
  is_webdriver: z.boolean().optional().default(false),
  is_headless: z.boolean().optional().default(false),
});

export type ClientFingerprintInput = z.infer<typeof ClientFingerprintSchema>;

// ============================================
// Tools Schemas
// ============================================

export const IpLookupSchema = z.object({
  ip: z.string().ip().optional(),
});

export type IpLookupInput = z.infer<typeof IpLookupSchema>;

export const PortScanSchema = z.object({
  ip: z.string().ip().optional(),
  ports: z.array(z.number().int().min(1).max(65535)).max(20).optional(),
});

export type PortScanInput = z.infer<typeof PortScanSchema>;

export const LeakTestSchema = z.object({
  webrtc_ips: z.array(z.string()).optional().default([]),
  dns_servers: z.array(z.string()).optional().default([]),
  ipv6_address: z.string().nullable().optional(),
});

export type LeakTestInput = z.infer<typeof LeakTestSchema>;

export const WebRTCCheckSchema = z.object({
  webrtc_ips: z.array(z.string()),
});

export type WebRTCCheckInput = z.infer<typeof WebRTCCheckSchema>;

// ============================================
// Simulation Schemas
// ============================================

export const RecaptchaSimulationSchema = z.object({
  score: z.number().min(0).max(1),
  action: z.string().max(100).optional().default('submit'),
});

export type RecaptchaSimulationInput = z.infer<typeof RecaptchaSimulationSchema>;

export const BehaviorEventSchema = z.object({
  type: z.enum(['mouse', 'click', 'scroll', 'keypress']),
  timestamp: z.number().int().positive(),
  x: z.number().optional(),
  y: z.number().optional(),
  key: z.string().max(50).optional(),
  velocity: z.number().optional(),
});

export const BehaviorSessionSchema = z.object({
  session_id: z.string().uuid().optional(),
  events: z.array(BehaviorEventSchema).min(1).max(10000),
  start_time: z.number().int().positive().optional(),
  end_time: z.number().int().positive().optional(),
});

export type BehaviorSessionInput = z.infer<typeof BehaviorSessionSchema>;

// ============================================
// Turnstile Schemas
// ============================================

export const TurnstileVerifySchema = z.object({
  token: z.string().min(1).max(2048),
});

export type TurnstileVerifyInput = z.infer<typeof TurnstileVerifySchema>;

// ============================================
// Validation Middleware Helper
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details: z.ZodError['errors'] };

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: 'Validation failed',
    details: result.error.errors,
  };
}

// ============================================
// Error Response Helper
// ============================================

export function formatValidationError(
  details: z.ZodError['errors']
): { field: string; message: string }[] {
  return details.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

// ============================================
// AI Chat Schemas
// ============================================

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  timestamp: z.number().int().positive(),
});

export const ChatRequestSchema = z.object({
  scan_id: z.string().uuid().optional(),
  message: z.string().min(1).max(2000), // Limit message length
  history: z.array(ChatMessageSchema).max(20), // Limit history to 20 messages
});

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
