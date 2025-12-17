'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

interface BehaviorEvent {
  type: 'mouse' | 'click' | 'scroll' | 'keypress';
  timestamp: number;
  x?: number;
  y?: number;
  key?: string;
  velocity?: number;
}

interface MouseStats {
  entropy: number;
  pointCount: number;
  avgSpeed: number;
  linearity: number;
  verdict: 'human' | 'suspicious' | 'bot';
  clickCount: number;
  scrollCount: number;
  keyCount: number;
}

interface AnalysisResult {
  session_id: string;
  timestamp: number;
  verdict: 'HUMAN' | 'BOT' | 'SUSPICIOUS' | 'UNKNOWN';
  human_probability: number;
  bot_probability: number;
  mouse_entropy: number;
  click_entropy: number;
  keyboard_entropy: number;
  scroll_entropy: number;
  scores: Array<{ factor: string; score: number; weight: number }>;
}

type ViewMode = 'trajectory' | 'heatmap' | 'velocity';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const HEATMAP_CELL_SIZE = 10;

export default function BehaviorSimPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  const [stats, setStats] = useState<MouseStats>({
    entropy: 0,
    pointCount: 0,
    avgSpeed: 0,
    linearity: 100,
    verdict: 'bot',
    clickCount: 0,
    scrollCount: 0,
    keyCount: 0
  });
  const [isTracking, setIsTracking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('trajectory');
  const [sessionDuration, setSessionDuration] = useState(0);

  const pointsRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const eventsRef = useRef<BehaviorEvent[]>([]);
  const heatmapDataRef = useRef<number[][]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize heatmap grid
  useEffect(() => {
    const cols = Math.ceil(CANVAS_WIDTH / HEATMAP_CELL_SIZE);
    const rows = Math.ceil(CANVAS_HEIGHT / HEATMAP_CELL_SIZE);
    heatmapDataRef.current = Array(rows).fill(null).map(() => Array(cols).fill(0));
  }, []);

  const calculateStats = useCallback((points: { x: number; y: number; t: number }[]) => {
    if (points.length < 2) return;

    let totalSpeed = 0;
    let speedVariance = 0;
    const speeds: number[] = [];

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dt = points[i].t - points[i - 1].t;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dt > 0 ? dist / dt : 0;
      speeds.push(speed);
      totalSpeed += speed;
    }

    const avgSpeed = speeds.length > 0 ? totalSpeed / speeds.length : 0;

    if (speeds.length > 1) {
      for (const speed of speeds) {
        speedVariance += Math.pow(speed - avgSpeed, 2);
      }
      speedVariance = Math.sqrt(speedVariance / speeds.length);
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const directDist = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
    );
    let totalDist = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }
    const linearity = totalDist > 0 ? Math.min(100, (directDist / totalDist) * 100) : 100;

    const entropy = Math.min(100, speedVariance * 10 + (100 - linearity) * 0.5);

    let verdict: 'human' | 'suspicious' | 'bot' = 'bot';
    if (entropy > 40 && linearity < 90 && points.length > 20) {
      verdict = 'human';
    } else if (entropy > 20 || (linearity < 95 && points.length > 10)) {
      verdict = 'suspicious';
    }

    setStats(prev => ({
      ...prev,
      entropy,
      pointCount: points.length,
      avgSpeed: avgSpeed * 1000,
      linearity,
      verdict
    }));
  }, []);

  const drawHeatmap = useCallback(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxValue = Math.max(...heatmapDataRef.current.flat(), 1);
    const rows = heatmapDataRef.current.length;
    const cols = heatmapDataRef.current[0]?.length || 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = heatmapDataRef.current[row][col];
        if (value > 0) {
          const intensity = value / maxValue;
          const hue = 120 - intensity * 120; // Green to red
          const saturation = 80;
          const lightness = 20 + intensity * 40;
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          ctx.fillRect(
            col * HEATMAP_CELL_SIZE,
            row * HEATMAP_CELL_SIZE,
            HEATMAP_CELL_SIZE,
            HEATMAP_CELL_SIZE
          );
        }
      }
    }

    // Draw legend
    ctx.fillStyle = '#71717a';
    ctx.font = '10px system-ui';
    ctx.fillText('Low', 10, canvas.height - 10);
    ctx.fillText('High', canvas.width - 30, canvas.height - 10);

    const gradient = ctx.createLinearGradient(40, canvas.height - 20, canvas.width - 40, canvas.height - 20);
    gradient.addColorStop(0, 'hsl(120, 80%, 30%)');
    gradient.addColorStop(0.5, 'hsl(60, 80%, 40%)');
    gradient.addColorStop(1, 'hsl(0, 80%, 50%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(40, canvas.height - 25, canvas.width - 80, 10);
  }, []);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Reset heatmap
    const cols = Math.ceil(CANVAS_WIDTH / HEATMAP_CELL_SIZE);
    const rows = Math.ceil(CANVAS_HEIGHT / HEATMAP_CELL_SIZE);
    heatmapDataRef.current = Array(rows).fill(null).map(() => Array(cols).fill(0));

    pointsRef.current = [];
    eventsRef.current = [];
    startTimeRef.current = 0;
    setSessionDuration(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStats({
      entropy: 0,
      pointCount: 0,
      avgSpeed: 0,
      linearity: 100,
      verdict: 'bot',
      clickCount: 0,
      scrollCount: 0,
      keyCount: 0
    });
    setIsTracking(false);
    setAnalysisResult(null);
    setViewMode('trajectory');
  }, []);

  const submitAnalysis = useCallback(async () => {
    if (eventsRef.current.length < 5) {
      toast('Need at least 5 events for analysis', 'error');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/simulation/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: eventsRef.current,
          start_time: startTimeRef.current,
          end_time: Date.now()
        })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json() as { status: string; data: AnalysisResult };
      if (result.status === 'ok') {
        setAnalysisResult(result.data);
        toast('Analysis complete!');
      }
    } catch {
      toast('Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resetCanvas();

    let lastPoint: { x: number; y: number; t: number } | null = null;

    function handleMove(event: MouseEvent) {
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      const t = Date.now();

      if (!isTracking) {
        startTimeRef.current = t;
        timerRef.current = setInterval(() => {
          setSessionDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
      }

      pointsRef.current.push({ x, y, t });

      // Calculate velocity if we have a last point
      let velocity = 0;
      if (lastPoint) {
        const dx = x - lastPoint.x;
        const dy = y - lastPoint.y;
        const dt = t - lastPoint.t;
        velocity = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;
      }

      eventsRef.current.push({
        type: 'mouse',
        timestamp: t,
        x,
        y,
        velocity
      });

      // Update heatmap
      const col = Math.floor(x / HEATMAP_CELL_SIZE);
      const row = Math.floor(y / HEATMAP_CELL_SIZE);
      if (heatmapDataRef.current[row]?.[col] !== undefined) {
        heatmapDataRef.current[row][col]++;
      }

      setIsTracking(true);

      // Draw based on view mode
      if (viewMode === 'trajectory' && lastPoint) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (viewMode === 'velocity' && lastPoint) {
        // Color based on velocity
        const hue = Math.max(0, 120 - velocity * 200);
        ctx.strokeStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.lineWidth = Math.min(6, 1 + velocity * 10);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      lastPoint = { x, y, t };

      if (pointsRef.current.length % 5 === 0) {
        calculateStats(pointsRef.current);
      }
    }

    function handleClick(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas!.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas!.height / rect.height);

      eventsRef.current.push({
        type: 'click',
        timestamp: Date.now(),
        x,
        y
      });

      setStats(prev => ({ ...prev, clickCount: prev.clickCount + 1 }));

      // Draw click indicator
      if (ctx) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function handleLeave() {
      lastPoint = null;
      if (pointsRef.current.length > 0) {
        calculateStats(pointsRef.current);
        if (viewMode === 'heatmap') {
          drawHeatmap();
        }
      }
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleLeave);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [calculateStats, resetCanvas, viewMode, drawHeatmap, isTracking]);

  // Track keyboard events
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (!isTracking) return;

      eventsRef.current.push({
        type: 'keypress',
        timestamp: Date.now(),
        key: event.key
      });

      setStats(prev => ({ ...prev, keyCount: prev.keyCount + 1 }));
    }

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isTracking]);

  // Track scroll events
  useEffect(() => {
    function handleScroll() {
      if (!isTracking) return;

      eventsRef.current.push({
        type: 'scroll',
        timestamp: Date.now(),
        y: window.scrollY
      });

      setStats(prev => ({ ...prev, scrollCount: prev.scrollCount + 1 }));
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTracking]);

  // Redraw heatmap when switching view modes
  useEffect(() => {
    if (viewMode === 'heatmap') {
      drawHeatmap();
    }
  }, [viewMode, drawHeatmap]);

  const verdictColors = {
    human: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    suspicious: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    bot: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    HUMAN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    SUSPICIOUS: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    BOT: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    UNKNOWN: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30'
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      {/* Header */}
      <div>
        <Link href="/simulation" className="text-xs text-zinc-500 hover:text-zinc-400">
          ← Back to Simulations
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-zinc-500">
          BrowserScan Simulation
        </p>
        <h1 className="text-3xl font-semibold text-zinc-50">Behavioral Telemetry Analysis</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Move your cursor, click, type, and scroll to generate behavioral data.
          Real-time entropy calculation detects human vs automated patterns.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        {(['trajectory', 'heatmap', 'velocity'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              viewMode === mode
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
        {isTracking && (
          <span className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Recording: {sessionDuration}s
          </span>
        )}
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
      >
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Entropy</p>
          <p className="text-lg font-semibold text-emerald-400">{stats.entropy.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Points</p>
          <p className="text-lg font-semibold text-zinc-200">{stats.pointCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Speed</p>
          <p className="text-lg font-semibold text-zinc-200">{stats.avgSpeed.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Linearity</p>
          <p className="text-lg font-semibold text-zinc-200">{stats.linearity.toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Clicks</p>
          <p className="text-lg font-semibold text-amber-400">{stats.clickCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Keys</p>
          <p className="text-lg font-semibold text-sky-400">{stats.keyCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-center">
          <p className="text-[10px] text-zinc-500">Scrolls</p>
          <p className="text-lg font-semibold text-violet-400">{stats.scrollCount}</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${verdictColors[stats.verdict]}`}>
          <p className="text-[10px] opacity-70">Verdict</p>
          <p className="text-lg font-semibold capitalize">{stats.verdict}</p>
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`w-full rounded-2xl border border-zinc-800/80 cursor-crosshair ${
            viewMode === 'heatmap' ? 'hidden' : ''
          }`}
        />
        <canvas
          ref={heatmapCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`w-full rounded-2xl border border-zinc-800/80 ${
            viewMode === 'heatmap' ? '' : 'hidden'
          }`}
        />
        <AnimatePresence>
          {!isTracking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <p className="text-sm text-zinc-600">
                Move your cursor here to start tracking
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={resetCanvas}
          className="flex-1 rounded-xl border border-zinc-700 bg-black/40 py-3 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300"
        >
          Reset Canvas
        </button>
        <button
          onClick={submitAnalysis}
          disabled={isAnalyzing || eventsRef.current.length < 5}
          className="flex-1 rounded-xl border border-emerald-600 bg-emerald-600/20 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Server Analysis'}
        </button>
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Server Analysis Result</h3>
              <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${verdictColors[analysisResult.verdict]}`}>
                {analysisResult.verdict}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500">Human Probability</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {analysisResult.human_probability.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Bot Probability</p>
                <p className="text-lg font-semibold text-rose-400">
                  {analysisResult.bot_probability.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Mouse Entropy</p>
                <p className="text-lg font-semibold text-zinc-200">
                  {analysisResult.mouse_entropy.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Keyboard Entropy</p>
                <p className="text-lg font-semibold text-zinc-200">
                  {analysisResult.keyboard_entropy.toFixed(2)}
                </p>
              </div>
            </div>

            {analysisResult.scores.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">Score Breakdown</p>
                {analysisResult.scores.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{s.factor}</span>
                    <span className="font-mono text-zinc-200">
                      {s.score.toFixed(1)} × {s.weight}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detection Factors */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
          <h3 className="text-sm font-semibold text-zinc-100">Human Indicators</h3>
          <ul className="mt-3 space-y-2 text-xs text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">+</span>
              High speed variance (natural hesitation)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">+</span>
              Curved, non-linear trajectories
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">+</span>
              Micro-corrections and overshoots
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">+</span>
              Variable dwell times
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">+</span>
              Natural typing rhythm variation
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
          <h3 className="text-sm font-semibold text-zinc-100">Bot Indicators</h3>
          <ul className="mt-3 space-y-2 text-xs text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="text-rose-400">-</span>
              Constant movement speed
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">-</span>
              Perfect straight lines
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">-</span>
              Precise pixel-perfect targeting
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">-</span>
              No natural jitter or noise
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">-</span>
              Mechanical typing patterns
            </li>
          </ul>
        </div>
      </div>

      {/* Technical Explanation */}
      <div className="rounded-2xl border border-zinc-800/80 bg-black/40 p-5">
        <h3 className="text-sm font-semibold text-zinc-100">How It Works</h3>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          This tool uses Shannon entropy calculations to analyze behavioral patterns.
          Human movements exhibit natural randomness and micro-variations, while automated
          scripts typically produce unnaturally smooth or perfectly timed sequences.
          The analysis considers mouse trajectory curvature, velocity variance, click timing,
          typing rhythm, and scroll patterns to distinguish humans from bots.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-emerald-400">Shannon</p>
            <p className="text-[10px] text-zinc-500">Entropy Algorithm</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-sky-400">Multi-Signal</p>
            <p className="text-[10px] text-zinc-500">Analysis</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-amber-400">Real-Time</p>
            <p className="text-[10px] text-zinc-500">Detection</p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="mt-12 space-y-8 border-t border-zinc-800 pt-10">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Is Behavioral Biometrics? (Your Mouse Movements Are Unique)
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Let me tell you something wild. The way you move your mouse is as unique as your fingerprint.
            The speed you type, how long you hesitate before clicking, the little curves in your cursor
            movements - all of it forms a behavioral signature that is incredibly hard to fake. This is
            behavioral biometrics, and it is how modern systems tell humans from bots.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Here is the thing: in 2024, automated bots make up 51% of all internet traffic. More than half.
            And 37% of that is bad bots - scrapers, credential stuffers, fraud tools. Traditional CAPTCHAs
            are annoying and increasingly ineffective. Behavioral biometrics watches how you interact with
            a page and makes a decision in the background. No clicking on fire hydrants required.
          </p>
        </div>

        {/* Bot Traffic Statistics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            The Bot Problem: 2024 Statistics
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Understanding why behavioral detection matters requires understanding the scale of the bot problem:
          </p>
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Metric</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-400">Source</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Automated bot traffic (total)</td>
                  <td className="px-4 py-3 font-mono text-amber-400">51%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Imperva 2025 Report</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Bad bot traffic (malicious)</td>
                  <td className="px-4 py-3 font-mono text-rose-400">37%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Imperva 2025 Report</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Good bot traffic</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">14%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Imperva 2025 Report</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Account takeover attacks (YoY)</td>
                  <td className="px-4 py-3 font-mono text-rose-400">+40%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Imperva 2025 Report</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">Bot traffic to travel sites</td>
                  <td className="px-4 py-3 font-mono text-amber-400">48%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Imperva 2025 Report</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">API attacks from advanced bots</td>
                  <td className="px-4 py-3 font-mono text-rose-400">44%</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">Imperva 2025 Report</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            Simple bots grew from 40% to 45% of bad bot traffic in 2024. AI and LLMs have made bot creation
            easier than ever. That is why behavioral detection has become critical - it is the only way to
            catch sophisticated automation that passes traditional fingerprint checks.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Websites Track Your Mouse Movements
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Every time you move your mouse, your browser fires a &quot;mousemove&quot; event with exact coordinates and
            a timestamp. A behavioral analysis system captures these events - sometimes hundreds per second -
            and looks for patterns. Humans are sloppy. We overshoot targets, make tiny corrections, hesitate
            before clicking. Our movement speed varies naturally based on distance and intent.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Bots, on the other hand, tend to be too perfect. They move in straight lines at constant speeds.
            They target elements with pixel-perfect accuracy. They do not exhibit the micro-variations that
            come from muscles, motor neurons, and human indecision. Modern detection looks at dozens of
            signals: trajectory curvature, velocity variance, acceleration patterns, dwell time before clicks.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-emerald-400">Human Patterns</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Curved, slightly chaotic trajectories</li>
                <li>• Variable movement speed</li>
                <li>• Overshoots and corrections</li>
                <li>• Natural hesitation before actions</li>
                <li>• Micro-jitter from hand tremor</li>
              </ul>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-rose-400">Bot Patterns</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Perfectly straight lines</li>
                <li>• Constant or mechanical speed</li>
                <li>• Pixel-perfect targeting</li>
                <li>• Instant or uniform timing</li>
                <li>• Zero natural variation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Typing Patterns Are Like Fingerprints
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Your typing rhythm - called keystroke dynamics - is remarkably consistent and unique. The time
            between pressing and releasing a key (dwell time), the time between keys (flight time), and the
            patterns specific to certain letter combinations all create a behavioral fingerprint. Some systems
            can identify individual users with 98%+ accuracy just from how they type.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Bots either type too fast (inhuman speed), too evenly (no natural rhythm variation), or in
            patterns that do not match the expected character sequences. Even sophisticated bots that add
            random delays struggle to replicate the subtle timing variations that come naturally to humans.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            What Is Entropy and Why Does It Matter?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Entropy, in this context, measures randomness or unpredictability. Think of it this way: if you
            flip a coin 100 times, you would expect roughly 50 heads and 50 tails with some variation. That
            is high entropy - unpredictable. If you got exactly 50-50 every time, something is probably rigged.
            That is low entropy - suspiciously predictable.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Human behavior has naturally high entropy. Your mouse movements, typing speed, and click timing
            all vary in ways that are hard to predict. Bots tend to have low entropy - their actions are
            too consistent, too predictable. Our tool calculates Shannon entropy on your behavioral data
            to measure this unpredictability. Higher entropy suggests human behavior.
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-200">Entropy Scores Explained</h3>
            <div className="grid gap-4 md:grid-cols-3 text-xs">
              <div className="text-center">
                <p className="text-2xl font-semibold text-rose-400">0-20</p>
                <p className="text-zinc-500">Very predictable, likely automated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-amber-400">20-40</p>
                <p className="text-zinc-500">Suspicious, needs more data</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-emerald-400">40+</p>
                <p className="text-zinc-500">Natural variation, likely human</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            How Bot Detection Systems Actually Work
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Real-world bot detection is not just one signal - it is dozens or hundreds combined. Systems like
            reCAPTCHA v3, Cloudflare Turnstile, and commercial fraud detection platforms look at:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-sky-400">Passive Signals</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Mouse movement patterns</li>
                <li>• Typing dynamics</li>
                <li>• Scroll behavior</li>
                <li>• Touch gestures (mobile)</li>
                <li>• Sensor data (accelerometer)</li>
                <li>• Session timing patterns</li>
              </ul>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-violet-400">Active Signals</h3>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• Browser fingerprinting</li>
                <li>• JavaScript execution timing</li>
                <li>• Canvas/WebGL rendering</li>
                <li>• TLS fingerprinting (JA3)</li>
                <li>• IP reputation checks</li>
                <li>• Cookie and storage analysis</li>
              </ul>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            The combination creates a probability score. No single signal is definitive, but patterns across
            many signals build confidence. This is why sophisticated fraud requires mimicking behavior across
            all these dimensions - and why it is increasingly difficult.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Why This Tool Exists
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            This behavioral analysis tool serves two purposes. First, education: seeing how your movements
            translate to entropy scores helps you understand what bot detection systems are looking for.
            Second, testing: if you are building anti-fraud systems or testing browser automation, you can
            verify whether your scripts exhibit human-like behavior.
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            We do not store or transmit your behavioral data. The analysis happens locally in your browser.
            The server analysis option sends events to our worker for entropy calculations but does not log
            or retain the data. This is a privacy tool at its core - we practice what we preach.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Can bots learn to mimic human behavior?</h3>
              <p className="text-xs text-zinc-500">
                Yes, to some extent. Advanced bots use recordings of real human behavior or AI-generated patterns.
                But replicating the subtle micro-variations across all signals simultaneously is extremely hard.
                Detection systems also evolve - it is an ongoing arms race.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Is behavioral tracking a privacy concern?</h3>
              <p className="text-xs text-zinc-500">
                It depends on implementation. Legitimate bot detection analyzes patterns without necessarily
                storing or identifying individuals. But the same technology can be used for tracking. As with
                fingerprinting, the technique itself is neutral - intent matters.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-200">Why am I getting flagged as suspicious?</h3>
              <p className="text-xs text-zinc-500">
                Moving too slowly or too purposefully can look automated. Natural browsing involves quick,
                varied movements. If you are carefully moving the cursor in straight lines, you will score
                lower on entropy. Just browse normally and the scores will reflect human behavior.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
