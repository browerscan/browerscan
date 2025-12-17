'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const simulations = [
  {
    href: '/simulation/recaptcha',
    title: 'reCAPTCHA v3 Emulator',
    desc: 'Tune Google score outputs (0.1-0.9) to benchmark anti-bot posture and understand scoring thresholds.',
    icon: '🤖',
    color: 'border-sky-500/30 hover:border-sky-500/50',
    badge: 'Interactive'
  },
  {
    href: '/simulation/turnstile',
    title: 'Cloudflare Turnstile',
    desc: 'Validate Turnstile response tokens and test CAPTCHA bypass detection in a safe sandbox.',
    icon: '🛡️',
    color: 'border-orange-500/30 hover:border-orange-500/50',
    badge: 'Token Verify'
  },
  {
    href: '/simulation/behavior',
    title: 'Behavioral Telemetry',
    desc: 'Mouse trajectory entropy analysis, dwell-time heuristics, and bot pattern detection.',
    icon: '🖱️',
    color: 'border-emerald-500/30 hover:border-emerald-500/50',
    badge: 'Real-time'
  }
];

export default function SimulationIndexPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Lab</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Bot Detection Simulation</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Test and rehearse detection signals in a safe sandbox environment before production deployment.
          Understand how anti-bot systems evaluate browser behavior.
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
      >
        <p className="text-sm text-amber-400">
          <span className="font-semibold">Lab Environment</span> — These simulations run locally in your browser.
          No data is sent to external servers. Use these tools to understand how detection systems work.
        </p>
      </motion.div>

      {/* Simulation Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {simulations.map((sim, index) => (
          <motion.div
            key={sim.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={sim.href}
              className={`block rounded-2xl border bg-black/40 p-5 transition hover:-translate-y-1 hover:bg-black/60 ${sim.color}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{sim.icon}</span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {sim.badge}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-100">{sim.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{sim.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">How Detection Works</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-sky-400">1. Signal Collection</p>
            <p className="text-xs text-zinc-500">
              Systems collect browser fingerprints, behavior patterns, and network characteristics.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-amber-400">2. Score Calculation</p>
            <p className="text-xs text-zinc-500">
              Machine learning models analyze signals to generate trust/risk scores.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-emerald-400">3. Decision Making</p>
            <p className="text-xs text-zinc-500">
              Based on scores, systems allow, challenge, or block the visitor.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Bot Detection: How Websites Tell Humans from Machines
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is a fact that might surprise you: more than half of all internet traffic in 2024
            comes from bots, not humans. According to the 2025 Imperva Bad Bot Report, automated
            traffic now accounts for 51% of web traffic globally. That means when a website owner
            looks at their analytics, they are seeing more bot visits than human visits. This is
            why bot detection has become one of the most critical technologies on the internet.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Bot detection systems like Google reCAPTCHA and Cloudflare Turnstile are everywhere.
            reCAPTCHA is used on over 10 million websites worldwide. Around 11.2% of all websites
            in the US alone use some form of CAPTCHA system. These tools sit at the gates of
            login pages, checkout flows, and contact forms, silently evaluating every visitor
            and deciding whether to let them through, challenge them, or block them entirely.
          </p>
        </div>

        {/* Bot Detection Market Statistics */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Bot Detection Technology Landscape 2024</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-left text-xs font-medium text-zinc-500">Solution</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">Market Position</th>
                  <th className="pb-3 text-right text-xs font-medium text-zinc-500">Key Feature</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Google reCAPTCHA</td>
                  <td className="py-3 text-right font-mono text-emerald-400">10M+ sites</td>
                  <td className="py-3 text-right text-zinc-400">Behavior scoring (0.0-1.0)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">Cloudflare Turnstile</td>
                  <td className="py-3 text-right font-mono text-sky-400">Fast-growing</td>
                  <td className="py-3 text-right text-zinc-400">Zero-friction invisible</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">hCaptcha</td>
                  <td className="py-3 text-right font-mono text-amber-400">Privacy-first</td>
                  <td className="py-3 text-right text-zinc-400">No data collection</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="py-3">HUMAN Bot Defender</td>
                  <td className="py-3 text-right font-mono text-violet-400">Enterprise</td>
                  <td className="py-3 text-right text-zinc-400">99%+ accuracy</td>
                </tr>
                <tr>
                  <td className="py-3">DataDome</td>
                  <td className="py-3 text-right font-mono text-rose-400">Enterprise</td>
                  <td className="py-3 text-right text-zinc-400">Real-time ML detection</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Source: BuiltWith, MerginIT CAPTCHA Solutions 2025 Report
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Google reCAPTCHA v3 Actually Works
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me break down reCAPTCHA v3 in simple terms. When you visit a website using reCAPTCHA
            v3, Google starts watching everything you do. Not in a creepy way, but in a pattern-analysis
            way. It tracks how your mouse moves across the page. It measures how long you spend
            looking at different sections. It watches your typing rhythm. It checks if your JavaScript
            execution matches normal browser behavior.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            All of this data feeds into a machine learning model that outputs a single number
            between 0.0 and 1.0. A score of 1.0 means you are almost certainly a human. A score
            of 0.0 means you are almost certainly a bot. Most real humans score between 0.7 and
            0.9. The website owner decides what threshold to use. Some sites block anything below
            0.5. Others only block below 0.3. The key thing to understand is that reCAPTCHA v3 is
            invisible. You never see a checkbox or an image puzzle. It is running in the background,
            constantly scoring your behavior.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Cloudflare Turnstile: The Privacy-Focused Alternative
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cloudflare built Turnstile as a direct response to reCAPTCHA. The pitch is simple:
            same bot detection capability, but without sending all your behavioral data to Google.
            Turnstile runs a series of non-interactive JavaScript challenges that probe your browser
            environment. It tests proof-of-work algorithms, checks for specific Web APIs, and looks
            for browser quirks that distinguish real browsers from headless automation tools.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            The result is a token that your server can verify with Cloudflare to confirm the challenge
            was completed successfully. What makes Turnstile different is that it adjusts difficulty
            dynamically. If your browser looks suspicious, it runs harder challenges. If everything
            looks normal, it passes you through almost instantly. Users rarely see any visible
            widget or challenge. It all happens invisibly, typically in under 300 milliseconds.
          </p>
        </div>

        {/* Accuracy Comparison */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-100">Bot Detection Effectiveness</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-rose-400">~50%</p>
              <p className="mt-1 text-xs text-zinc-500">Bot traffic allowed by reCAPTCHA (UC Irvine 2023)</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">99%+</p>
              <p className="mt-1 text-xs text-zinc-500">Enterprise solutions accuracy</p>
            </div>
            <div className="rounded-xl bg-zinc-800/50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">$0.02</p>
              <p className="mt-1 text-xs text-zinc-500">Cost per reCAPTCHA solve (CAPTCHA farms)</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Sources: UC Irvine Research 2023, OOPSpam 2024
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Behavioral Biometrics: The Next Evolution
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            CAPTCHA systems are reactive. They challenge users after suspicious behavior is detected.
            Behavioral biometrics is proactive. It creates a continuous profile of how you interact
            with a website and flags anomalies in real-time. Every person has unique patterns:
            how fast you move your mouse, how you curve around corners, how long you pause between
            actions, your typing cadence, even how you hold your phone.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            These patterns are nearly impossible for bots to replicate convincingly. A bot can
            click coordinates, but it cannot reproduce the subtle acceleration curves of a human
            wrist movement. Our behavioral telemetry simulation lets you see this in action.
            Watch your own mouse movements get tracked, see the entropy calculations, and understand
            how detection systems distinguish human randomness from mechanical precision.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why Simulations Matter for Security Testing
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            If you are building anti-fraud systems, you need to understand how attackers think.
            If you are testing your own security posture, you need to know what detection systems
            see. Our simulation tools let you experiment with different score thresholds, test
            token verification flows, and observe behavioral analysis in a safe sandbox environment.
            No external data is sent. Everything runs locally in your browser.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Security researchers use these simulations to understand detection mechanisms. Penetration
            testers use them to assess bypass resistance. Developers use them to tune their own
            implementations. The goal is education and testing, not evasion. Understanding how
            these systems work is the first step to building better defenses.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Arms Race Between Bots and Detection
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the uncomfortable reality: bot detection is an arms race, and the bots are
            winning in some areas. CAPTCHA-solving services can defeat reCAPTCHA for about $0.02
            per solve. Research from UC Irvine found that reCAPTCHA allows approximately 50% of
            bot traffic through. AI-powered bots are getting better at mimicking human behavior,
            and large language models have made it easier than ever to generate human-like
            interactions at scale.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is why multi-layered detection matters. No single system catches everything.
            The most effective approaches combine CAPTCHA challenges, behavioral analysis, device
            fingerprinting, and IP reputation scoring. Our tools help you understand each layer
            so you can build more robust defenses. The bots are getting smarter. Your detection
            needs to be smarter too.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Who Needs Bot Detection Simulations
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">E-commerce Security Teams</h3>
              <p className="text-xs text-zinc-500">
                Online retailers face constant bot attacks: inventory hoarding, credential stuffing,
                price scraping, and fake reviews. Understanding detection systems helps you protect
                your platform and your customers.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">API Security Engineers</h3>
              <p className="text-xs text-zinc-500">
                44% of advanced bot attacks now target APIs directly. If you are building or
                protecting APIs, you need to understand how bots evade detection and how to
                strengthen your defenses.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Fraud Prevention Analysts</h3>
              <p className="text-xs text-zinc-500">
                Account takeover attacks increased 74% year-over-year in 2024. Simulating detection
                systems helps you understand attack vectors and tune your fraud rules accordingly.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">QA and Testing Teams</h3>
              <p className="text-xs text-zinc-500">
                Testing websites with CAPTCHA protection requires understanding how these systems
                behave. Our simulations help you design test cases that account for detection
                mechanisms without triggering false positives.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Performance and User Experience Tradeoffs
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Every bot detection system comes with tradeoffs. reCAPTCHA v3 can add 100-200
            milliseconds to page load times. reCAPTCHA v2 (the checkbox version) has 27% lower
            completion rates on mobile devices. Aggressive bot blocking can frustrate legitimate
            users who happen to be using VPNs or privacy tools. Too permissive, and you let bad
            actors through.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cloudflare Turnstile and similar invisible solutions minimize friction, but they
            require trust in the detection accuracy. If the invisible challenge fails, you either
            block a legitimate user or let a bot through. There is no image puzzle fallback.
            Understanding these tradeoffs through simulation helps you make informed decisions
            about which solutions fit your use case and what thresholds to configure.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Getting Started with Our Simulations
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Each simulation tool above focuses on a different aspect of bot detection. The reCAPTCHA
            v3 emulator lets you experiment with score thresholds and see how different scores
            map to human versus bot verdicts. The Cloudflare Turnstile tester validates token
            formats and helps you understand the verification flow. The behavioral telemetry
            analyzer shows you real-time mouse tracking, entropy calculations, and pattern
            detection.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            All of these tools run locally in your browser. We are not sending your data anywhere.
            We are not building profiles on you. We are giving you the same visibility that
            detection systems have, so you can understand and improve your security posture.
            Pick a simulation above and start experimenting. The best defense is understanding
            the offense.
          </p>
        </div>
      </section>
    </div>
  );
}
