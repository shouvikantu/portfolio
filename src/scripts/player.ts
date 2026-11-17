import { activeWordIndex, shouldAnimate } from '../lib/caption';
import { barHeights } from '../lib/waveform';
import { barState, type WaveMode } from '../lib/waveAnim';

const GAP = 6;
const BAR = 3;
const INTRO_SECONDS = 1.1;
const LABELS = { playing: 'Pause caption', paused: 'Play caption', idle: 'Replay caption' } as const;

type Colors = { accent: string; soft: string; rest: string };

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function setupPlayer(root: HTMLElement, reduced: boolean): void {
  const canvas = root.querySelector<HTMLCanvasElement>('.player-wave');
  const button = root.querySelector<HTMLButtonElement>('.player-btn');
  const elapsed = root.querySelector<HTMLElement>('[data-elapsed]');
  const words = Array.from(root.querySelectorAll<HTMLElement>('.caption .w'));
  const ctx = canvas?.getContext('2d');
  if (!canvas || !button || !ctx) return;

  const duration = Number(root.dataset.duration ?? 14);
  const seed = Number(root.dataset.seed ?? 3);
  let heights: number[] = [];
  let colors: Colors = readColors();
  let mode: WaveMode = reduced ? 'idle' : 'intro';
  let modeStart = performance.now();
  let progress = reduced ? 1 : 0;
  let playFrom = 0;
  let frame = 0;
  let visible = true;
  let lastClock = '';

  function readColors(): Colors {
    const s = getComputedStyle(root);
    return {
      accent: s.getPropertyValue('--accent').trim() || '#e8552f',
      soft: s.getPropertyValue('--accent-soft').trim() || '#ff9a76',
      rest: s.getPropertyValue('--wave-rest').trim() || '#17202c',
    };
  }

  function resize(): void {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas!.getBoundingClientRect();
    canvas!.width = Math.max(1, Math.round(width * ratio));
    canvas!.height = Math.max(1, Math.round(height * ratio));
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    heights = barHeights(Math.max(1, Math.floor(width / GAP)), seed);
    draw(performance.now());
  }

  function setMode(next: WaveMode, now: number): void {
    mode = next;
    modeStart = now;
    root.classList.toggle('is-playing', next === 'playing' || next === 'intro');
    if (next === 'playing' || next === 'paused' || next === 'idle') button!.setAttribute('aria-label', LABELS[next]);
    if (next === 'idle') setWords(null);
  }

  function setWords(index: number | null): void {
    words.forEach((w, i) => w.classList.toggle('dim', index !== null && i > index));
  }

  function draw(now: number): void {
    const width = canvas!.clientWidth;
    const height = canvas!.clientHeight;
    const t = (now - modeStart) / 1000;
    const mid = height / 2;
    const grad = ctx!.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, colors.soft);
    grad.addColorStop(0.5, colors.accent);
    grad.addColorStop(1, colors.soft);

    ctx!.clearRect(0, 0, width, height);
    heights.forEach((h, i) => {
      const s = barState(i, heights.length, progress, t, mode);
      const barHeight = Math.min(height - 2, Math.max(s.scale > 0 ? 2 : 0, h * height * 0.62 * s.scale));
      if (barHeight <= 0) return;
      const x = i * GAP + 1;
      ctx!.globalAlpha = s.played ? 1 : 0.2;
      ctx!.fillStyle = s.played ? grad : colors.rest;
      ctx!.shadowColor = colors.accent;
      ctx!.shadowBlur = s.glow > 0.05 ? 14 * s.glow : 0;
      ctx!.beginPath();
      ctx!.roundRect(x, mid - barHeight / 2, BAR, barHeight, BAR / 2);
      ctx!.fill();
    });
    ctx!.shadowBlur = 0;
    ctx!.globalAlpha = 1;

    if (mode === 'playing' || mode === 'paused') {
      const x = Math.round(progress * width) + 0.5;
      ctx!.fillStyle = colors.accent;
      ctx!.shadowColor = colors.accent;
      ctx!.shadowBlur = 10;
      ctx!.fillRect(x - 1, 2, 2, height - 4);
      ctx!.beginPath();
      ctx!.arc(x, 4, 3.5, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.shadowBlur = 0;
    }

    const label = clock(progress * duration);
    if (elapsed && label !== lastClock) { elapsed.textContent = label; lastClock = label; }
  }

  function tick(now: number): void {
    frame = 0;
    if (mode === 'intro' && (now - modeStart) / 1000 >= INTRO_SECONDS) {
      playFrom = 0;
      setMode('playing', now);
    }
    if (mode === 'playing') {
      progress = Math.min(1, playFrom + (now - modeStart) / (duration * 1000));
      setWords(activeWordIndex(progress, words.length));
      if (progress >= 1) setMode('idle', now);
    }
    draw(now);
    if (visible && !document.hidden && mode !== 'paused') frame = requestAnimationFrame(tick);
  }

  function run(): void {
    if (!frame && !reduced) frame = requestAnimationFrame(tick);
  }

  new ResizeObserver(resize).observe(canvas);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { colors = readColors(); draw(performance.now()); });

  root.classList.add('ready');
  if (reduced) {
    resize();
    return;
  }
  button.hidden = false;

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) run();
  }).observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    // Don't let the playhead jump ahead by the time the tab was hidden.
    if (mode === 'playing') { playFrom = progress; modeStart = performance.now(); }
    run();
  });

  button.addEventListener('click', () => {
    const now = performance.now();
    if (mode === 'playing') {
      setMode('paused', now);
      cancelAnimationFrame(frame);
      frame = 0;
      draw(now);
      return;
    }
    if (mode === 'paused') {
      playFrom = progress;
    } else {
      playFrom = 0;
      progress = 0;
      setWords(0);
    }
    setMode('playing', now);
    run();
  });

  setWords(0);
  setMode('intro', performance.now());
  resize();
  run();
}

export function initPlayers(): void {
  const reduced = !shouldAnimate(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.querySelectorAll<HTMLElement>('[data-player]').forEach((el) => setupPlayer(el, reduced));
}
