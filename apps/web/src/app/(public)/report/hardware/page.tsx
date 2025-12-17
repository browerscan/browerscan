'use client';

import Link from 'next/link';
import { HardwarePanel } from '@/components/sections/hardware-panel';
import { LeakPanels } from '@/components/sections/leak-panels';
import { useLiveReport } from '@/lib/use-live-report';

export default function HardwareReportPage() {
  const { data: report, isLoading } = useLiveReport();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-zinc-800"></div>
          <div className="h-4 w-full max-w-md rounded bg-zinc-800"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
          <p className="text-zinc-400">No scan data available. Please run a scan first.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-sky-400 hover:text-sky-300">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/report" className="text-xs text-zinc-500 hover:text-zinc-400">← Back to Report</Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">Hardware Layer</p>
        <h1 className="text-3xl font-semibold text-zinc-50">Canvas, WebGL & Sensor Fingerprints</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Unmasked GPU vendors, canvas signatures, audio fingerprints, and environment concurrency metrics.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        <Link href="/report/network" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Network</Link>
        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">Hardware</span>
        <Link href="/report/software" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Software</Link>
        <Link href="/report/consistency" className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-700">Consistency</Link>
      </div>

      {/* Hardware Panel */}
      <HardwarePanel report={report} />

      {/* Leak Panels */}
      <LeakPanels report={report} />

      {/* Info Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">Hardware Detection Explained</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-sky-400">Canvas Fingerprint</p>
            <p className="mt-1 text-xs text-zinc-500">
              Rendering text and graphics produces unique pixel patterns based on GPU, drivers, and OS configuration.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-violet-400">WebGL Renderer</p>
            <p className="mt-1 text-xs text-zinc-500">
              GPU vendor and model strings exposed through WebGL debugging extensions identify specific hardware.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-400">Audio Context</p>
            <p className="mt-1 text-xs text-zinc-500">
              Audio processing characteristics create unique signatures based on audio hardware and software stack.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Your Hardware Is Talking About You Behind Your Back
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me explain something wild. Your computer has a unique way of drawing pictures. Not like
            handwriting - we are talking about how your GPU renders pixels. When a website asks your
            browser to draw some text or a simple image on a canvas element, the exact pixels it produces
            depend on your specific graphics card, your drivers, your operating system, even your font
            settings. This is canvas fingerprinting, and according to the Tor Project, it is the single
            largest fingerprinting threat browsers face today.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the thing that blows people&apos;s minds: you cannot clear this fingerprint like you
            clear cookies. It is not stored anywhere on your computer. It is generated fresh every time
            a website asks your browser to draw something. The fingerprint comes from your hardware itself.
            And unless you change your graphics card, drivers, or operating system, it stays the same
            across every website you visit.
          </p>
        </div>

        {/* Hardware Fingerprinting Statistics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Numbers: How Unique Is Your Hardware?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Research shows that hardware fingerprinting can identify individuals with surprisingly high
            accuracy. Here is what the data tells us:
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Overall fingerprint uniqueness</td>
                  <td className="px-4 py-3 font-mono text-rose-400">89.4%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Academic Research</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Mobile device unique fingerprints</td>
                  <td className="px-4 py-3 font-mono text-amber-400">73%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Gómez-Boix et al. 2018</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Desktop unique fingerprints</td>
                  <td className="px-4 py-3 font-mono text-sky-400">35%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Large-scale study (2M+)</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Canvas-caused uniqueness (mobile)</td>
                  <td className="px-4 py-3 font-mono text-violet-400">62%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Gómez-Boix et al. 2018</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Audio fingerprint uniqueness</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">99.6%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">AudioContext Research</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">GPU fingerprint accuracy</td>
                  <td className="px-4 py-3 font-mono text-rose-400">98%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">DrawnApart Study 2022</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Note: A 2018 study collecting 2+ million fingerprints found only 33.6% were unique, showing
            that data collection methodology significantly impacts results. Real-world uniqueness depends
            on population size and diversity.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Canvas Fingerprinting: Drawing Your Identity
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Think of canvas fingerprinting like this. Imagine asking a thousand different artists to
            draw the exact same picture following the exact same instructions. Even though they are all
            following identical steps, tiny differences in their technique, their brushes, their paint,
            would make each result slightly different. That is what happens when your browser renders
            graphics.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            A tracking script asks your browser to draw some text - usually something with various
            fonts, colors, and shapes. The HTML5 Canvas API renders this image. Then the script reads
            the raw pixel data and creates a hash. This hash is your canvas fingerprint. Different
            combinations of GPU, driver version, operating system, font rendering engine, and
            anti-aliasing settings produce different pixel values.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Factors That Affect Canvas</h3>
              <ul className="space-y-1 text-xs text-zinc-500">
                <li>• GPU model and driver version</li>
                <li>• Operating system font rendering</li>
                <li>• Anti-aliasing settings</li>
                <li>• Screen pixel density (DPI)</li>
                <li>• Browser rendering engine</li>
                <li>• Installed fonts</li>
              </ul>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">The Good News</h3>
              <p className="text-xs text-zinc-500">
                Popular device configurations often share fingerprints. All MacBook Pros from 2020-2024
                with default Safari settings produce identical canvas fingerprints. Windows 11 + Chrome
                + Intel integrated graphics is shared by millions. The more common your setup, the
                better you blend in.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            WebGL: Your GPU Is Wearing a Name Tag
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            WebGL is a JavaScript API for rendering 3D graphics. Cool for games and visualizations.
            Also a goldmine for fingerprinting. When your browser initializes WebGL, it exposes detailed
            information about your graphics hardware. Not just that you have an NVIDIA card - the exact
            model: &quot;NVIDIA GeForce RTX 4090&quot;. The exact driver version. The exact capabilities.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            But it gets more interesting. A 2022 study called DrawnApart discovered that even identical
            GPUs produce slightly different results when performing certain calculations. Manufacturing
            variations at the silicon level create unique signatures. The researchers achieved 98%
            classification accuracy in just 150 milliseconds. They could distinguish between two
            identical graphics cards because no two chips are exactly alike.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">What WebGL Exposes</h3>
            <div className="grid gap-4 md:grid-cols-2 text-xs">
              <div>
                <p className="text-violet-400 font-medium mb-2">Explicit Information</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• GPU vendor (NVIDIA, AMD, Intel)</li>
                  <li>• GPU model name and series</li>
                  <li>• Driver version information</li>
                  <li>• Supported extensions list</li>
                  <li>• Maximum texture sizes</li>
                </ul>
              </div>
              <div>
                <p className="text-rose-400 font-medium mb-2">Implicit Fingerprinting</p>
                <ul className="text-zinc-500 space-y-1">
                  <li>• Shader compilation differences</li>
                  <li>• Floating-point precision variations</li>
                  <li>• Pixel interpolation patterns</li>
                  <li>• Rendering pipeline quirks</li>
                  <li>• Silicon-level manufacturing variance</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            Combined with canvas, audio, and font fingerprinting, WebGL helps websites uniquely identify
            over 85% of visitors. This happens without any cookies, without any permission prompts,
            completely silently in the background.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            AudioContext: The Sound of Your Hardware
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Audio fingerprinting is sneaky. It does not play any sound you can hear. Instead, it uses
            the Web Audio API to generate an inaudible waveform - like a sine wave at a frequency you
            cannot perceive. This waveform passes through your audio processing pipeline: your audio
            drivers, your operating system&apos;s audio stack, your browser&apos;s audio implementation.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Each step introduces tiny numerical variations. When the script reads the processed audio
            data and hashes it, the result is unique to your specific combination of hardware and
            software. Research shows audio fingerprints can be 99.6% unique. The technique was first
            documented in the wild in 2016 by Princeton researcher Steven Englehardt in his study of
            one million websites.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">OscillatorNode</h3>
              <p className="text-xs text-zinc-500">
                Generates periodic waveforms (sine, triangle, square). Different browsers implement
                these slightly differently due to divergent code paths since 2012.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">DynamicsCompressor</h3>
              <p className="text-xs text-zinc-500">
                Processes audio through compression algorithms. Floating-point math variations create
                device-specific outputs.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">AnalyserNode</h3>
              <p className="text-xs text-zinc-500">
                Reads final frequency data. The hash of this data becomes your audio fingerprint -
                consistent across sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Screen, Memory, and CPU: The Easy Stuff
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Beyond the sophisticated fingerprinting techniques, browsers also expose basic hardware
            information that adds to your fingerprint. Your screen resolution and color depth. The
            number of CPU cores (navigator.hardwareConcurrency). Your device memory
            (navigator.deviceMemory). Your pixel ratio for high-DPI displays.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Individually, these are not very unique. Millions of people have 1920x1080 screens with
            8 CPU cores and 8GB of RAM. But combined with canvas, WebGL, and audio fingerprints, they
            narrow down possibilities. A 4K display with 16 cores and 32GB of RAM is less common.
            A 5120x1440 ultrawide with 24 cores even less so.
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Attribute</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">API</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Privacy Impact</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Screen Resolution</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">screen.width/height</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Medium - unusual sizes stand out</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Color Depth</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">screen.colorDepth</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Low - most are 24-bit</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Device Pixel Ratio</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">devicePixelRatio</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Medium - identifies Retina/HiDPI</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">CPU Cores</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">hardwareConcurrency</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Medium - high core counts rare</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Device Memory</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">deviceMemory</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Medium - capped at 8GB in Chrome</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to Reduce Your Hardware Fingerprint
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Complete protection against hardware fingerprinting is nearly impossible without breaking
            the web. But you can reduce your uniqueness:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Use Common Hardware</h3>
              <p className="text-xs text-zinc-500">
                Popular configurations blend in. MacBook with Safari, Windows with Chrome and Intel
                graphics, iPhone with Safari - these produce fingerprints shared by millions. Exotic
                setups stand out.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Tor Browser</h3>
              <p className="text-xs text-zinc-500">
                The only browser that blocks canvas, WebGL, and audio fingerprinting by default. All
                Tor users share the same fingerprint. The downside: it is slow and some sites block it.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-400">Brave Browser (Aggressive)</h3>
              <p className="text-xs text-zinc-500">
                In aggressive fingerprint protection mode, Brave randomizes canvas and WebGL values.
                This can break some websites but significantly reduces tracking.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Firefox with resist</h3>
              <p className="text-xs text-zinc-500">
                Firefox&apos;s privacy.resistFingerprinting option spoofs many hardware values. It
                reports standard screen sizes, generic WebGL info, and blocks audio fingerprinting.
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Warning: Anti-fingerprinting extensions that add random noise can actually make you more
            unique. If your Canvas claims one GPU but renders like another, you are flagged as
            suspicious. Consistency matters.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Understanding Your Hardware Report
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Canvas Hash</h3>
              <p className="text-xs text-zinc-500">
                The hash shown is derived from rendering test patterns. If it matches common hashes
                in our database, you blend in. Unique hashes mean you are more trackable.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">WebGL Renderer</h3>
              <p className="text-xs text-zinc-500">
                Shows your GPU vendor and model. Generic values like &quot;ANGLE&quot; indicate browser
                abstraction layers. Specific GPU names are more identifying.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Audio Fingerprint</h3>
              <p className="text-xs text-zinc-500">
                The audio processing signature. Highly stable across sessions. If blocked or returning
                unusual values, it may indicate anti-fingerprinting measures.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Hardware Specs</h3>
              <p className="text-xs text-zinc-500">
                Screen, CPU cores, and memory add entropy to your fingerprint. Unusual combinations
                increase uniqueness. Standard specs help you blend in.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
