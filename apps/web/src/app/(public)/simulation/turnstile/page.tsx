'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import { PUBLIC_TURNSTILE_SITE_KEY } from '@/lib/env.client';
import { useToast } from '@/components/ui/toast';

type VerifyResult = {
  success: boolean;
  message: string;
  details?: string;
  challenge_timestamp?: string;
  hostname?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileSimPage() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [useRealWidget, setUseRealWidget] = useState(false);
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasSiteKey = PUBLIC_TURNSTILE_SITE_KEY.length > 0;

  useEffect(() => {
    if (!widgetLoaded || !useRealWidget || !hasSiteKey || !containerRef.current) return;

    // Render Turnstile widget
    if (window.turnstile && !widgetRef.current) {
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: PUBLIC_TURNSTILE_SITE_KEY,
        callback: (responseToken: string) => {
          setToken(responseToken);
          toast('Turnstile challenge completed!');
        },
        'error-callback': () => {
          toast('Turnstile challenge failed', 'error');
        },
        theme: 'dark',
        size: 'normal'
      });
    }

    return () => {
      if (widgetRef.current && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [widgetLoaded, useRealWidget, hasSiteKey, toast]);

  async function verify() {
    if (!token.trim()) {
      toast('Please enter or generate a token first', 'error');
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/turnstile-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json() as {
        status: string;
        data?: {
          success: boolean;
          challenge_timestamp?: string;
          hostname?: string;
          errors?: string[];
        };
      };

      if (data.status === 'ok' && data.data) {
        if (data.data.success) {
          setResult({
            success: true,
            message: 'Token Verified Successfully',
            details: 'Cloudflare confirmed this token is valid.',
            challenge_timestamp: data.data.challenge_timestamp,
            hostname: data.data.hostname
          });
          toast('Token verified successfully!');
        } else {
          setResult({
            success: false,
            message: 'Verification Failed',
            details: data.data.errors?.join(', ') || 'Token validation failed.'
          });
          toast('Token verification failed', 'error');
        }
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Verification Error',
        details: error instanceof Error ? error.message : 'Failed to verify token with Cloudflare API.'
      });
      toast('Verification error occurred', 'error');
    } finally {
      setVerifying(false);
    }
  }

  function resetWidget() {
    setToken('');
    setResult(null);
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={() => setWidgetLoaded(true)}
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        {/* Header */}
        <div>
          <Link href="/simulation" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Simulations</Link>
          <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Simulation</p>
          <h1 className="text-3xl font-semibold text-zinc-50">Cloudflare Turnstile Verification</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {hasSiteKey
              ? 'Test real Turnstile widget or manually verify tokens using Cloudflare\'s API.'
              : 'Enter a Turnstile token to verify with Cloudflare\'s API. Configure NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable the live widget.'
            }
          </p>
        </div>

        {/* Mode Toggle */}
        {hasSiteKey && (
          <div className="flex gap-2">
            <button
              onClick={() => setUseRealWidget(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                !useRealWidget
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Manual Token Entry
            </button>
            <button
              onClick={() => setUseRealWidget(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                useRealWidget
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Live Turnstile Widget
            </button>
          </div>
        )}

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6"
        >
          <div className="space-y-4">
            {useRealWidget && hasSiteKey ? (
              // Live Turnstile Widget Mode
              <div>
                <label className="text-sm font-medium text-zinc-300">Turnstile Widget</label>
                <div className="mt-3 flex items-center justify-center rounded-xl border border-zinc-700 bg-black/40 py-8">
                  <div ref={containerRef} />
                </div>
                {token && (
                  <div className="mt-3">
                    <label className="text-xs text-zinc-500">Generated Token:</label>
                    <textarea
                      value={token}
                      readOnly
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-400 resize-none"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Manual Token Entry Mode
              <div>
                <label className="text-sm font-medium text-zinc-300">Turnstile Response Token</label>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste cf-turnstile-response token here..."
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black/40 px-4 py-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={verify}
                disabled={verifying || !token.trim()}
                className="flex-1 rounded-xl border border-orange-500/40 bg-orange-500/10 py-3 text-sm font-medium text-orange-400 transition hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Verifying...' : 'Verify Token with Cloudflare API'}
              </button>
              <button
                onClick={resetWidget}
                className="rounded-xl border border-zinc-700 bg-black/40 px-4 py-3 text-sm text-zinc-400 transition hover:border-zinc-600"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 ${
                result.success
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-rose-500/30 bg-rose-500/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.success ? '✓' : '✗'}
                </span>
                <p className={`font-semibold ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.message}
                </p>
              </div>
              {result.details && (
                <p className="mt-2 text-sm text-zinc-400">{result.details}</p>
              )}
              {result.success && (result.challenge_timestamp || result.hostname) && (
                <div className="mt-3 space-y-1 border-t border-emerald-500/20 pt-3 text-xs">
                  {result.challenge_timestamp && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Challenge Time:</span>
                      <span className="font-mono text-zinc-300">{new Date(result.challenge_timestamp).toLocaleString()}</span>
                    </div>
                  )}
                  {result.hostname && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hostname:</span>
                      <span className="font-mono text-zinc-300">{result.hostname}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Token Info */}
        <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
          <h3 className="text-sm font-semibold text-zinc-100">How to Get Token</h3>
          <ol className="mt-3 space-y-2 text-xs text-zinc-400">
            <li className="flex gap-2">
              <span className="text-orange-400 font-mono">1.</span>
              <span>Embed Turnstile widget on your page</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400 font-mono">2.</span>
              <span>Complete the invisible challenge</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400 font-mono">3.</span>
              <span>Token appears in hidden input field</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400 font-mono">4.</span>
              <span>Copy from cf-turnstile-response</span>
            </li>
          </ol>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
          <h3 className="text-sm font-semibold text-zinc-100">Token Properties</h3>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Format</span>
              <span className="text-zinc-300">Base64-encoded JWT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Typical Length</span>
              <span className="text-zinc-300">200-300 characters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Expiration</span>
              <span className="text-zinc-300">300 seconds (5 min)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Single Use</span>
              <span className="text-emerald-400">Yes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Server-side Verification */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Server-Side Verification</h3>
        <p className="mt-2 text-xs text-zinc-500">
          In production, always verify tokens server-side using Cloudflare&apos;s siteverify API:
        </p>
        <pre className="mt-3 rounded-xl bg-zinc-900/80 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
{`POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/json

{
  "secret": "YOUR_SECRET_KEY",
  "response": "TOKEN_FROM_CLIENT",
  "remoteip": "USER_IP" // optional
}`}
        </pre>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What is Cloudflare Turnstile and Why It Matters
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cloudflare Turnstile is a new kind of bot detection that launched in 2022 as a direct
            alternative to Google reCAPTCHA. The pitch is simple: invisible bot protection without
            sending all your behavioral data to Google. No image puzzles, no checkboxes, no
            frustrating challenges. Just silent verification that happens in milliseconds.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Turnstile matters because it represents a shift in how we think about CAPTCHA. For
            years, reCAPTCHA dominated the market, protecting over 10 million websites. But
            reCAPTCHA comes with a cost: every user interaction gets analyzed by Google, feeding
            their advertising and tracking infrastructure. Cloudflare built Turnstile to prove
            that effective bot detection does not require surveillance.
          </p>
        </div>

        {/* Turnstile Stats */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Cloudflare Turnstile Key Features</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">Free</p>
              <p className="mt-1 text-xs text-zinc-500">Unlimited verifications</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-sky-400">300ms</p>
              <p className="mt-1 text-xs text-zinc-500">Typical verification time</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">0</p>
              <p className="mt-1 text-xs text-zinc-500">User interaction needed</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-violet-400">5 min</p>
              <p className="mt-1 text-xs text-zinc-500">Token expiration</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Source: Cloudflare Turnstile Documentation 2024
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Turnstile Works Under the Hood
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            When a page with Turnstile loads, Cloudflare runs a series of non-interactive JavaScript
            challenges in the background. These are not visible to the user. The challenges probe
            your browser environment, testing things like proof-of-work computations, Web API
            availability, and browser quirks that distinguish real browsers from headless
            automation tools.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The clever part is adaptive difficulty. If your browser looks completely normal,
            Turnstile runs minimal challenges and passes you through in under 300 milliseconds.
            If something looks suspicious, it runs harder challenges that take longer and probe
            deeper. In rare cases where invisible verification fails, Turnstile can fall back
            to a visible widget, but most users never see it.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Turnstile Tokens
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            When Turnstile completes its verification, it generates a token. This token is a
            Base64-encoded string, typically 200-300 characters long, that your server can
            verify with Cloudflare. The token proves that the browser completed the challenge
            at a specific time. Each token is single-use and expires after 300 seconds (5 minutes).
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The token itself does not contain your score or verdict. It is an encrypted reference
            that only Cloudflare can decode. When your server sends the token to Cloudflare&apos;s
            siteverify endpoint, you get back a JSON response indicating whether the verification
            succeeded, when it happened, and the action name if you specified one.
          </p>
        </div>

        {/* Token Verification Response */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Verification Response Structure</h3>
          <pre className="rounded-xl bg-zinc-900/80 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
{`{
  "success": true,
  "challenge_ts": "2024-01-15T10:30:00Z",
  "hostname": "example.com",
  "error-codes": [],
  "action": "login",
  "cdata": ""
}`}
          </pre>
          <div className="mt-4 space-y-2 text-xs text-zinc-400">
            <p><span className="text-emerald-400">success</span>: Whether the challenge was completed</p>
            <p><span className="text-sky-400">challenge_ts</span>: Timestamp of verification (ISO 8601)</p>
            <p><span className="text-amber-400">hostname</span>: Site where challenge was solved</p>
            <p><span className="text-violet-400">action</span>: Action name you specified (optional)</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Turnstile vs reCAPTCHA: Key Differences
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The biggest difference is data handling. reCAPTCHA sends behavioral data to Google,
            where it feeds into their broader tracking and advertising systems. Turnstile keeps
            verification data within Cloudflare and does not build cross-site profiles. If privacy
            matters to you or your users, this is a significant advantage.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            reCAPTCHA provides a score (0.0 to 1.0) that you interpret however you want. Turnstile
            gives you a binary pass/fail result. This is simpler to implement but less flexible.
            You cannot set different thresholds for different actions the way you can with
            reCAPTCHA v3. If you need granular scoring, reCAPTCHA might be better suited.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Turnstile vs reCAPTCHA Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-left text-xs font-medium text-zinc-500">Feature</th>
                  <th className="pb-3 text-center text-xs font-medium text-zinc-500">Turnstile</th>
                  <th className="pb-3 text-center text-xs font-medium text-zinc-500">reCAPTCHA v3</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Price</td>
                  <td className="py-3 text-center text-emerald-400">Free unlimited</td>
                  <td className="py-3 text-center text-amber-400">Free up to 1M/month</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">User friction</td>
                  <td className="py-3 text-center text-emerald-400">Invisible</td>
                  <td className="py-3 text-center text-emerald-400">Invisible</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Result type</td>
                  <td className="py-3 text-center text-sky-400">Pass/Fail</td>
                  <td className="py-3 text-center text-sky-400">Score (0.0-1.0)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Data to third party</td>
                  <td className="py-3 text-center text-emerald-400">Minimal</td>
                  <td className="py-3 text-center text-rose-400">Behavioral data to Google</td>
                </tr>
                <tr>
                  <td className="py-3">Fallback challenge</td>
                  <td className="py-3 text-center text-amber-400">Visible widget</td>
                  <td className="py-3 text-center text-amber-400">reCAPTCHA v2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Implementing Turnstile Correctly
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Implementation starts with adding the Turnstile widget to your page. You get a site
            key from the Cloudflare dashboard and embed a small JavaScript snippet. The widget
            can be invisible (completely hidden), managed (you control when it renders), or
            explicit (visible widget). For most use cases, invisible or managed modes work best.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Server-side verification is mandatory. Never trust the client-side callback alone.
            When your form submits, include the Turnstile token. Your server then sends this
            token to Cloudflare&apos;s siteverify endpoint along with your secret key. Only proceed
            if the verification succeeds. This prevents attackers from bypassing Turnstile by
            simply not including the widget.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Common Token Validation Errors
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Turnstile returns specific error codes when verification fails. &quot;missing-input-secret&quot;
            means you forgot to include your secret key. &quot;invalid-input-secret&quot; means the key
            is wrong. &quot;missing-input-response&quot; means no token was provided. &quot;invalid-input-response&quot;
            means the token is malformed or already used. &quot;timeout-or-duplicate&quot; means the token
            expired or was submitted twice.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The most common mistake is reusing tokens. Each token is single-use. If a user
            submits a form, the token is consumed. If they go back and submit again with the
            same token, verification fails. Your frontend needs to request a fresh token for
            each submission attempt. Turnstile provides methods to reset the widget and get
            a new token.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            When Turnstile Shows a Visible Widget
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Most of the time, Turnstile works invisibly. But if the browser fails invisible
            verification, Turnstile falls back to a visible widget. This usually shows a brief
            loading animation followed by a success checkmark. In rare cases, users might need
            to click to complete verification.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Visible widgets appear more often for users with unusual browser configurations,
            VPN users, or when JavaScript execution behaves unexpectedly. If your users frequently
            see visible widgets, check if your page has JavaScript errors, conflicting scripts,
            or security policies that interfere with Turnstile&apos;s challenges.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Using This Validator
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The validator above lets you test Turnstile tokens without connecting to your own
            server. Paste a token and click verify to see how our validation logic responds.
            This helps you understand token format requirements and common error states. Note
            that real verification requires your secret key and Cloudflare&apos;s siteverify endpoint.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Use this tool during development to debug token issues. If your tokens are too short,
            you might be capturing the wrong input. If tokens start with certain prefixes, they
            might indicate specific challenge results. Understanding token structure helps you
            build more robust error handling in your applications.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Best Practices for Production
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Always verify tokens server-side. Never skip verification based on the presence
            of a token alone. Log verification failures for security monitoring. Set up alerts
            for sudden increases in failures, which might indicate an attack or configuration
            problem. Use action names to distinguish different forms and track verification
            success rates per action.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Consider what happens when Turnstile is unavailable. Cloudflare has excellent uptime,
            but no service is 100% reliable. Have a fallback plan: maybe you accept submissions
            with additional verification steps, or you queue them for manual review. Do not let
            a Turnstile outage completely block legitimate users from your application.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Future of Bot Detection
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Turnstile represents the direction bot detection is heading: invisible, privacy-respecting,
            and adaptive. Users should not have to prove they are human through tedious puzzles.
            Verification should happen silently, in the background, without collecting data for
            advertising profiles. As AI gets better at solving traditional CAPTCHAs, behavioral
            analysis and browser fingerprinting become more important than image recognition.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cloudflare continues to improve Turnstile, adding new detection capabilities and
            reducing false positives. If you are currently using reCAPTCHA and privacy is a
            concern for your users, Turnstile is worth evaluating. The migration is straightforward,
            and the privacy benefits are meaningful. The best bot detection is the kind your
            users never notice.
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
