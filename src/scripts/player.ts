import { activeWordIndex, shouldAnimate } from '../lib/caption';
import { barHeights } from '../lib/waveform';

const GAP = 6;
const BAR = 3;

function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function setupPlayer(root: HTMLElement, reduced: boolean): void {
  const canvas = root.querySelector<HTMLCanvasElement>('.player-wave');
  const button = root.querySelector<HTMLButtonElement>('.player-btn');
  const elapsed = root.querySelector<HTMLElement>('[data-elapsed]');
  const words = Array.from(root.querySelectorAll<HTMLElement>('.caption .w'));
  if (!canvas || !button) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const duration = Number(root.dataset.duration ?? 14);
  const seed = Number(root.dataset.seed ?? 3);
  let heights: number[] = [];
  let progress = 1;
  let frame = 0;

  function resize(): void {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas!.getBoundingClientRect();
    canvas!.width = Math.max(1, Math.round(width * ratio));
    canvas!.height = Math.max(1, Math.round(height * ratio));
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    heights = barHeights(Math.max(1, Math.floor(width / GAP)), seed);
    draw();
  }

  function draw(): void {
    const width = canvas!.clientWidth;
    const height = canvas!.clientHeight;
    const styles = getComputedStyle(root);
    const played = styles.getPropertyValue('--accent').trim() || '#e8552f';
    const rest = styles.getPropertyValue('--wave-rest').trim() || '#17202c';
    ctx!.clearRect(0, 0, width, height);
    heights.forEach((h, i) => {
      const isPlayed = i / heights.length < progress;
      const barHeight = Math.max(2, h * height * 0.92);
      ctx!.globalAlpha = isPlayed ? 1 : 0.22;
      ctx!.fillStyle = isPlayed ? played : rest;
      ctx!.fillRect(i * GAP + 1, (height - barHeight) / 2, BAR, barHeight);
    });
    ctx!.globalAlpha = 1;
    if (elapsed) elapsed.textContent = clock(progress * duration);
  }

  function setWords(index: number | null): void {
    words.forEach((w, i) => w.classList.toggle('dim', index !== null && i > index));
  }

  function play(): void {
    cancelAnimationFrame(frame);
    const start = performance.now();
    const tick = (now: number) => {
      progress = Math.min(1, (now - start) / (duration * 1000));
      setWords(progress < 1 ? activeWordIndex(progress, words.length) : null);
      draw();
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  new ResizeObserver(resize).observe(canvas);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
  resize();

  if (reduced) {
    button.addEventListener('click', draw);
    return;
  }
  button.addEventListener('click', play);
  progress = 0;
  play();
}

export function initPlayers(): void {
  const reduced = !shouldAnimate(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.querySelectorAll<HTMLElement>('[data-player]').forEach((el) => setupPlayer(el, reduced));
}
