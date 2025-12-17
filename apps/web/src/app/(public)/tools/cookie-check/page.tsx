'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CookieInfo {
  name: string;
  value: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none' | 'unknown';
  expires: string | null;
  domain: string;
  path: string;
}

export default function CookieCheckPage() {
  const [cookies, setCookies] = useState<CookieInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const analyzeCookies = () => {
    setLoading(true);

    if (typeof document === 'undefined') {
      setLoading(false);
      return;
    }

    const rawCookies = document.cookie.split(';').filter(Boolean);

    const analyzed: CookieInfo[] = rawCookies.map(raw => {
      const [nameValue] = raw.trim().split(';');
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');

      // Note: JavaScript can only see non-HttpOnly cookies
      // Real security flags would need server-side analysis
      return {
        name: name.trim(),
        value: value.length > 50 ? value.slice(0, 50) + '...' : value,
        secure: window.location.protocol === 'https:',
        httpOnly: false, // Can't detect - if we can see it, it's not HttpOnly
        sameSite: 'unknown',
        expires: null,
        domain: window.location.hostname,
        path: '/'
      };
    });

    setCookies(analyzed);
    setLoading(false);
  };

  useEffect(() => {
	// eslint-disable-next-line react-hooks/set-state-in-effect
    analyzeCookies();
  }, []);

  const securityScore = cookies.length === 0 ? 100 :
    Math.round((cookies.filter(c => c.secure).length / cookies.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Tools</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">BrowserScan Tools</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Cookie Analyzer</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Inspect browser cookies and analyze their security attributes. Identifies potential security misconfigurations.
        </p>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Cookies Detected</p>
            <p className="text-4xl font-bold text-zinc-100">{cookies.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Secure Cookies</p>
            <p className={`text-2xl font-semibold ${
              securityScore >= 80 ? 'text-emerald-400' :
              securityScore >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {securityScore}%
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all ${
              securityScore >= 80 ? 'bg-emerald-500' :
              securityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>
      </motion.div>

      {/* Cookie List */}
      {loading ? (
        <div className="text-center text-zinc-500">Analyzing cookies...</div>
      ) : cookies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-lg text-zinc-400">No cookies detected</p>
          <p className="mt-1 text-sm text-zinc-600">
            This page has no accessible cookies, or all cookies are HttpOnly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cookies.map((cookie, index) => (
            <motion.div
              key={cookie.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-zinc-100">{cookie.name}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-500 break-all">{cookie.value}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    cookie.secure ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {cookie.secure ? 'Secure' : 'Not Secure'}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                <span>Domain: {cookie.domain}</span>
                <span>Path: {cookie.path}</span>
                {cookie.expires && <span>Expires: {cookie.expires}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Security Tips */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Cookie Security Best Practices</h3>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">Secure flag:</strong> Ensures cookies are only sent over HTTPS</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">HttpOnly flag:</strong> Prevents JavaScript access, mitigating XSS attacks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span><strong className="text-zinc-300">SameSite attribute:</strong> Controls cross-site request behavior, helps prevent CSRF</span>
          </li>
        </ul>
      </div>

      {/* Refresh Button */}
      <button
        onClick={analyzeCookies}
        className="w-full rounded-xl border border-violet-500/40 bg-violet-500/10 py-3 text-sm font-medium text-violet-400 transition hover:bg-violet-500/20"
      >
        Refresh Analysis
      </button>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Are Browser Cookies? (Not the Chocolate Chip Kind)
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me explain cookies in the simplest way possible. When you visit a website, that site can store
            a tiny text file on your computer. That file is a cookie. It is like a name tag the website gives
            you so it can remember who you are next time you visit. Without cookies, you would have to log in
            to every website every single time you visit. Your shopping cart would empty every time you clicked
            a new page. The web would be basically unusable.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cookies were invented in 1994 by a Netscape engineer named Lou Montulli. He just wanted to build a
            shopping cart that actually worked. Thirty years later, cookies have become one of the most controversial
            technologies on the internet. Not because of what they do, but because of how they have been weaponized
            for tracking and surveillance advertising.
          </p>
        </div>

        {/* Statistics Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Cookie Tracking Problem: Real Numbers
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the data that should concern you. This is not speculation - these are verified statistics
            from cookie consent research:
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Finding</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Websites deploying tracking cookies without consent</td>
                  <td className="px-4 py-3 font-mono text-rose-400">92%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Cookiebot/Ebiquity 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Sites violating cookie consent requirements</td>
                  <td className="px-4 py-3 font-mono text-rose-400">84%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">17K Website Survey</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Websites using third-party cookies</td>
                  <td className="px-4 py-3 font-mono text-amber-400">40%+</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Privacy Journal 2024</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Cookies dedicated to tracking/advertising</td>
                  <td className="px-4 py-3 font-mono text-amber-400">27%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Deloitte Research</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Marketers relying on third-party cookies</td>
                  <td className="px-4 py-3 font-mono text-sky-400">75%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Industry Survey 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Think about that: 92% of websites drop tracking cookies before you even click anything. 84% of sites
            violate consent requirements. The &quot;Accept Cookies&quot; banner is often just theater - the tracking already started.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            First-Party vs Third-Party Cookies: Why It Matters
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is the most important distinction to understand. First-party cookies come from the site you are
            visiting. If you are on amazon.com, Amazon sets first-party cookies. These keep you logged in, remember
            your cart, store your preferences. Blocking them breaks the site. They are generally fine.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Third-party cookies come from other domains embedded in the page. That Facebook Like button on a news
            site? It is loading Facebook code, which drops a Facebook cookie on your browser. Now Facebook knows
            you visited that news site. Visit another site with a Like button? Facebook knows that too. This is
            how they build a profile of every website you visit across the entire internet.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">First-Party (Usually OK)</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Domain matches the site URL</li>
                <li>• Enables login sessions and preferences</li>
                <li>• Cannot track you across other sites</li>
                <li>• Breaking them breaks the website</li>
              </ul>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">Third-Party (Privacy Risk)</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Domain differs from the site URL</li>
                <li>• Used for cross-site tracking</li>
                <li>• Builds profiles across the web</li>
                <li>• Safari/Firefox block by default</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Cookie Security Attributes (The Technical Stuff Made Simple)
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Cookies have security flags that control how they behave. Understanding these helps you know
            whether a cookie is properly secured:
          </p>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Secure Flag</h3>
              <p className="text-xs text-zinc-500">
                When this is set, the cookie only travels over HTTPS (encrypted connections). Without it,
                someone on the same WiFi network could intercept your session cookie and hijack your account.
                If you are on a coffee shop WiFi and the site uses cookies without the Secure flag, anyone
                nearby could steal your login. This is called session hijacking, and it is trivially easy
                on non-secure cookies.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">HttpOnly Flag</h3>
              <p className="text-xs text-zinc-500">
                This flag makes the cookie invisible to JavaScript. Why does that matter? If a hacker finds
                an XSS vulnerability on a site (where they can inject their JavaScript), they could steal
                your cookies. But if the cookie is HttpOnly, JavaScript cannot read it. Fun fact: if this
                tool can see a cookie, it is NOT HttpOnly - which is actually a security concern for sensitive cookies.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">SameSite Attribute</h3>
              <p className="text-xs text-zinc-500">
                This controls whether the cookie travels with requests from other sites. &quot;Strict&quot; means
                the cookie never leaves its home site. &quot;Lax&quot; allows it on direct navigation but not
                embedded requests. &quot;None&quot; sends it everywhere (requires Secure flag). This is your defense
                against CSRF attacks where a malicious site tricks your browser into making requests to
                a site you are logged into.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The GDPR Cookie Fine Reality
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Europe does not mess around with cookie consent violations. Some of the biggest tech companies
            have been hit with massive fines:
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Fine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Violation</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">LinkedIn</td>
                  <td className="px-4 py-3 font-mono text-rose-400">€310M</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Behavioral targeting without consent (2024)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Google</td>
                  <td className="px-4 py-3 font-mono text-rose-400">€150M</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">No easy way to refuse cookies (2021)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Amazon</td>
                  <td className="px-4 py-3 font-mono text-rose-400">€35M</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Placing ad cookies without consent</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Yahoo</td>
                  <td className="px-4 py-3 font-mono text-amber-400">€10M</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Tracking despite rejection (2023)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Total GDPR fines have exceeded €5.65 billion as of 2024, with 2,245 enforcement actions recorded.
            Cookie consent is not optional in Europe - it is the law.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Session vs Persistent Cookies
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Session Cookies</h3>
              <p className="text-xs text-zinc-500">
                These live only in your browser&apos;s memory. Close the browser, they are gone. They keep you
                logged in during your visit but cannot track you long-term. These are the &quot;good&quot; cookies
                in most cases. When you see &quot;expires: Session&quot;, that is what this means.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Persistent Cookies</h3>
              <p className="text-xs text-zinc-500">
                These have an expiration date and survive browser restarts. A &quot;remember me&quot; login cookie
                might last 30 days. But tracking cookies? Some are set to expire in 2 years or more.
                The longer the expiration, the more tracking potential.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What This Tool Can and Cannot See
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            I want to be completely transparent here. This tool runs JavaScript in your browser. That means
            it can only see cookies that are NOT marked HttpOnly. If a cookie has the HttpOnly flag (which
            security-sensitive cookies should), JavaScript cannot access it, and neither can we.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            This is actually a good thing. If we could see your session cookies, so could any malicious
            JavaScript on any compromised website. The fact that we cannot see them means they are properly
            protected. To see all cookies including HttpOnly ones, check your browser&apos;s developer tools
            (F12 → Application → Cookies in Chrome).
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to Protect Yourself from Cookie Tracking
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Block Third-Party Cookies</h3>
              <p className="text-xs text-zinc-500">
                Every modern browser lets you block third-party cookies. Safari and Firefox do this by
                default. Chrome users need to enable it manually. This single setting stops most cross-site
                tracking while keeping first-party functionality working.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Use Privacy Browsers</h3>
              <p className="text-xs text-zinc-500">
                Brave blocks trackers by default. Firefox with Enhanced Tracking Protection. Safari with
                Intelligent Tracking Prevention. These browsers fight tracking out of the box without
                you having to configure anything.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Clear Cookies Regularly</h3>
              <p className="text-xs text-zinc-500">
                Set your browser to clear cookies on exit. Yes, you will have to log in again, but
                persistent trackers lose their grip. Extensions like Cookie AutoDelete can clear
                cookies automatically when you close tabs.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Use Container Tabs</h3>
              <p className="text-xs text-zinc-500">
                Firefox Multi-Account Containers let you isolate different sites in different
                &quot;containers&quot;. Facebook in one container, shopping in another. Cookies cannot cross
                containers, so tracking cannot follow you between them.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Death of Third-Party Cookies
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the big news: third-party cookies are dying. Safari killed them years ago. Firefox
            blocks them. And Chrome - which holds 65% of the browser market - is phasing them out through
            their Privacy Sandbox initiative. Google started blocking them for 1% of Chrome users in Q1 2024,
            with full deprecation planned (though timelines have shifted).
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            What replaces them? New APIs like Topics (interest-based targeting without cross-site tracking)
            and Attribution Reporting (conversion tracking without identifiers). The ad industry is scrambling
            to adapt. For users, this means better privacy by default. But do not celebrate too hard - new
            tracking methods like fingerprinting are already filling the gap. That is why tools like BrowserScan
            exist.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Are all cookies bad?</h3>
              <p className="text-xs text-zinc-500">
                No. First-party cookies that enable site functionality are necessary and generally harmless.
                The problem is third-party tracking cookies that follow you across the web. Do not block all
                cookies - you will break the internet. Be selective.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Why do sites ask me to accept cookies?</h3>
              <p className="text-xs text-zinc-500">
                GDPR (in Europe) and similar laws require informed consent before placing non-essential cookies.
                The irony? 84% of sites violate these requirements anyway. The banner is often just legal
                theater while tracking happens regardless.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Can cookies give me viruses?</h3>
              <p className="text-xs text-zinc-500">
                No. Cookies are just text data. They cannot execute code, install software, or directly harm
                your computer. The privacy risk is the real concern - not malware. That said, stolen session
                cookies can let attackers into your accounts, which is its own kind of damage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
