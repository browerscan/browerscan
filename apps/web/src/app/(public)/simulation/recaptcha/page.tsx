'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RecaptchaSimPage() {
  const [score, setScore] = useState(0.7);

  const getScoreColor = (s: number) => {
    if (s >= 0.7) return 'text-emerald-400';
    if (s >= 0.4) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (s: number) => {
    if (s >= 0.7) return 'bg-emerald-500';
    if (s >= 0.4) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getVerdict = (s: number) => {
    if (s >= 0.7) return { label: 'Human', desc: 'High confidence human interaction detected' };
    if (s >= 0.4) return { label: 'Suspicious', desc: 'Mixed signals - may require additional verification' };
    return { label: 'Bot', desc: 'Strong indicators of automated behavior' };
  };

  const verdict = getVerdict(score);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/simulation" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Simulations</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Simulation</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Google reCAPTCHA v3 Score</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Emulate reCAPTCHA v3 score outputs to understand how Google&apos;s invisible CAPTCHA evaluates visitors.
          Scores range from 0.0 (bot) to 1.0 (human).
        </p>
      </div>

      {/* Score Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Simulated Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-semibold ${getScoreColor(score)}`}>{verdict.label}</p>
            <p className="text-xs text-zinc-500 max-w-[200px]">{verdict.desc}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-3 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getScoreBg(score)}`}
            initial={{ width: 0 }}
            animate={{ width: `${score * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        {/* Scale Labels */}
        <div className="mt-2 flex justify-between text-xs text-zinc-600">
          <span>0.0 (Bot)</span>
          <span>0.5</span>
          <span>1.0 (Human)</span>
        </div>
      </motion.div>

      {/* Slider Control */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <label className="text-sm font-medium text-zinc-300">Adjust Score</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={score}
          onChange={(e) => setScore(parseFloat(e.target.value))}
          className="mt-4 w-full h-2 rounded-full bg-zinc-700 appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[0.1, 0.5, 0.9].map((preset) => (
            <button
              key={preset}
              onClick={() => setScore(preset)}
              className={`rounded-lg border py-2 text-sm font-medium transition ${
                score === preset
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {preset.toFixed(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Score Interpretation */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Score Interpretation Guide</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500 mt-1"></span>
            <div>
              <p className="text-sm text-zinc-200">0.7 - 1.0: Human</p>
              <p className="text-xs text-zinc-500">High confidence legitimate user. Allow access without friction.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="h-3 w-3 rounded-full bg-amber-500 mt-1"></span>
            <div>
              <p className="text-sm text-zinc-200">0.4 - 0.6: Suspicious</p>
              <p className="text-xs text-zinc-500">Mixed signals detected. Consider additional verification or monitoring.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="h-3 w-3 rounded-full bg-rose-500 mt-1"></span>
            <div>
              <p className="text-sm text-zinc-200">0.0 - 0.3: Bot</p>
              <p className="text-xs text-zinc-500">Strong automated behavior indicators. Block or challenge aggressively.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Notes */}
      <div className="rounded-xl border border-dashed border-zinc-800 p-4">
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Note:</span> Real reCAPTCHA v3 scores are generated by Google&apos;s ML models
          analyzing hundreds of signals including mouse movements, typing patterns, browser fingerprint, and historical behavior.
          This simulation is for educational purposes only.
        </p>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Google reCAPTCHA v3: The Invisible Gatekeeper
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            reCAPTCHA v3 is fundamentally different from the CAPTCHAs you grew up with. There are
            no image puzzles. No checkboxes. No &quot;select all the traffic lights&quot; challenges.
            Instead, it watches everything you do on a page and assigns you a score between 0.0
            and 1.0. A score of 1.0 means you are almost certainly human. A score of 0.0 means
            you are almost certainly a bot. Everything in between is varying degrees of confidence.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Google deployed reCAPTCHA v3 in 2018 as a response to two problems. First, traditional
            CAPTCHAs were becoming too easy for AI to solve. Image recognition models could
            identify street signs and storefronts better than most humans. Second, users hated
            CAPTCHA puzzles. They added friction to every form submission, hurting conversion
            rates and user experience. v3 solves both problems by making the challenge invisible.
          </p>
        </div>

        {/* reCAPTCHA Market Stats */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">reCAPTCHA by the Numbers</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">10M+</p>
              <p className="mt-1 text-xs text-zinc-500">Websites using reCAPTCHA</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-sky-400">11.2%</p>
              <p className="mt-1 text-xs text-zinc-500">US websites with CAPTCHA</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">~50%</p>
              <p className="mt-1 text-xs text-zinc-500">Bot traffic still passes</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-rose-400">$0.02</p>
              <p className="mt-1 text-xs text-zinc-500">Per CAPTCHA farm solve</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Sources: BuiltWith, UC Irvine Research 2023, OOPSpam 2024
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How reCAPTCHA v3 Analyzes Your Behavior
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The moment a reCAPTCHA v3-protected page loads, Google starts collecting data. Your
            mouse movements are tracked. How fast do you move? Do you take curved paths like
            a human wrist would, or straight lines like a script? When you move to click a button,
            do you overshoot slightly and correct, as humans naturally do? Or do you hit the
            exact pixel every time?
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Typing patterns matter too. Humans have variable timing between keystrokes. We pause
            slightly longer before hitting certain keys. We make mistakes and backspace. Bots
            tend to type at perfectly consistent speeds with no errors. reCAPTCHA analyzes these
            patterns along with scroll behavior, focus events, and time spent on different page
            sections.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Signals Behind Your Score
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            reCAPTCHA v3 combines behavioral signals with contextual data. Your browser fingerprint
            matters. Is your JavaScript execution consistent with a real browser? Are your reported
            screen dimensions realistic? Does your user agent match your actual rendering capabilities?
            Your IP address reputation matters. Has this IP been associated with bot traffic before?
            Is it a known VPN or proxy exit node?
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Historical behavior weighs heavily. If Google has seen your browser before and it
            behaved like a human, your baseline score is higher. If your browser has no history
            or has previously triggered bot detection, you start lower. This is why fresh browser
            profiles often get flagged even when controlled by real humans. Google prefers
            known entities.
          </p>
        </div>

        {/* Score Threshold Guide */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Score Threshold Recommendations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-left text-xs font-medium text-zinc-500">Action Type</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">Recommended Threshold</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">Rationale</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Login</td>
                  <td className="py-3 text-right font-mono text-emerald-400">0.5</td>
                  <td className="py-3 text-right text-zinc-400">Balance security with UX</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Registration</td>
                  <td className="py-3 text-right font-mono text-sky-400">0.6</td>
                  <td className="py-3 text-right text-zinc-400">Prevent fake accounts</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Checkout</td>
                  <td className="py-3 text-right font-mono text-amber-400">0.7</td>
                  <td className="py-3 text-right text-zinc-400">High-value transactions</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Password Reset</td>
                  <td className="py-3 text-right font-mono text-violet-400">0.7</td>
                  <td className="py-3 text-right text-zinc-400">Account security critical</td>
                </tr>
                <tr>
                  <td className="py-3">Comments/Reviews</td>
                  <td className="py-3 text-right font-mono text-rose-400">0.4</td>
                  <td className="py-3 text-right text-zinc-400">Lower friction, moderate risk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Scores Vary and What You Can Do
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your reCAPTCHA score is not fixed. It changes based on how you interact with each
            page. If you rush through a form immediately after page load, your score drops.
            If you take time to read the page, scroll naturally, and interact like a human,
            your score improves. VPN users often see lower scores because their IP addresses
            are shared with other users, some of whom may be bots.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Privacy-focused browser configurations can also hurt your score. Blocking JavaScript
            execution, spoofing user agents, or using aggressive ad blockers can trigger anomalies
            that lower your score. Google designed reCAPTCHA to favor browsers running default
            configurations with normal behavior patterns. The more you deviate, the more suspicious
            you look.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Limitations of reCAPTCHA v3
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            reCAPTCHA v3 is not perfect. Research from UC Irvine found that approximately 50%
            of bot traffic still passes through reCAPTCHA protections. CAPTCHA-solving services
            can defeat reCAPTCHA for about $0.02 per challenge by routing requests through
            human workers or sophisticated AI. Advanced bots now use machine learning to mimic
            human behavior patterns well enough to achieve passing scores.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            There are also privacy concerns. reCAPTCHA sends behavioral data to Google, which
            some users find unacceptable. The score calculation is a black box. You cannot see
            exactly why you received a particular score or how to improve it. Website owners
            have to trust Google&apos;s assessment without full visibility into the methodology.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Implementing reCAPTCHA v3 Correctly
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            If you are a developer implementing reCAPTCHA v3, there are best practices to follow.
            Load the script on every page, not just forms. This gives reCAPTCHA more behavioral
            data to work with. Use action names to distinguish different interactions (login,
            register, checkout) and set appropriate thresholds for each. Never rely solely on
            the score. Combine it with other signals like IP reputation, device fingerprinting,
            and velocity checks.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Handle low scores gracefully. Instead of blocking users outright, consider adding
            friction progressively. A score of 0.3 might trigger email verification. A score
            of 0.1 might require additional CAPTCHA challenges. This layered approach protects
            against bots while minimizing false positives that frustrate real users.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Using This Simulator
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            The simulator above lets you explore how different scores map to human/bot verdicts.
            Drag the slider to see how websites interpret various scores. A score of 0.9 looks
            clearly human. A score of 0.3 looks clearly suspicious. The gray zone between 0.4
            and 0.6 is where most of the interesting decisions happen.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Use this to understand threshold decisions. If you are building a system that uses
            reCAPTCHA, experiment with different cutoffs to balance security and user experience.
            If you are testing bot detection as a security researcher, understand where your
            test traffic falls on the scale and what that means for detection evasion.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Alternatives to reCAPTCHA
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            reCAPTCHA is not your only option. Cloudflare Turnstile offers similar invisible
            bot detection without sending behavioral data to Google. hCaptcha positions itself
            as a privacy-preserving alternative, though it often requires visible challenges.
            Enterprise solutions like HUMAN Bot Defender and DataDome claim 99%+ accuracy but
            come with significant costs.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The right choice depends on your priorities. If privacy is paramount, consider
            alternatives to Google. If you need maximum coverage and do not mind Google&apos;s
            data collection, reCAPTCHA v3 remains the most widely deployed option. For
            high-security applications, consider layering multiple detection methods rather
            than relying on any single provider.
          </p>
        </div>
      </section>
    </div>
  );
}
