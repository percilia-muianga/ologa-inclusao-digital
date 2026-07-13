import { useEffect, useState } from "react";

const STORAGE_KEY = "ologa-a11y";
const STEP = 0.1;
const MIN = 0.85;
const MAX = 1.4;

const RATE_STORAGE = "ologa-tts-rate";
const RATE_MIN = 0.75;
const RATE_MAX = 1.35;
const RATE_STEP = 0.1;

type Prefs = { scale: number; highContrast: boolean };

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.style.setProperty("--a11y-scale", String(prefs.scale));
  document.body?.classList.toggle("hc", prefs.highContrast);
}

function formatRate(r: number) {
  return `${r.toFixed(1).replace(".", ",")}×`;
}

export function AccessibilityBar() {
  const [prefs, setPrefs] = useState<Prefs>({ scale: 1, highContrast: false });
  const [rate, setRate] = useState<number>(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Prefs;
        setPrefs(parsed);
        applyPrefs(parsed);
      }
      const savedRate = localStorage.getItem(RATE_STORAGE);
      if (savedRate) setRate(Number(savedRate) || 1);
    } catch {
      /* ignore */
    }
  }, []);

  const update = (next: Prefs) => {
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const setRateSafe = (r: number) => {
    const clamped = Math.max(RATE_MIN, Math.min(RATE_MAX, Math.round(r * 10) / 10));
    setRate(clamped);
    try {
      localStorage.setItem(RATE_STORAGE, String(clamped));
    } catch {
      /* ignore */
    }
  };

  const dec = () =>
    update({ ...prefs, scale: Math.max(MIN, Math.round((prefs.scale - STEP) * 100) / 100) });
  const inc = () =>
    update({ ...prefs, scale: Math.min(MAX, Math.round((prefs.scale + STEP) * 100) / 100) });
  const toggle = () => update({ ...prefs, highContrast: !prefs.highContrast });
  const reset = () => {
    update({ scale: 1, highContrast: false });
    setRateSafe(1);
  };

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const btnBase =
    "inline-flex min-h-9 items-center justify-center rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-white/25 focus-visible:bg-white/25";
  const btnActive =
    "inline-flex min-h-9 items-center justify-center rounded-md border border-gold bg-gold px-3 py-1 text-xs font-bold text-navy transition-colors";

  return (
    <div
      className="a11y-bar bg-navy text-white"
      role="region"
      aria-label="Ferramentas de acessibilidade"
    >
      <div className="wrap flex flex-wrap items-center justify-end gap-2 py-2 text-xs">
        <span className="mr-1 font-bold text-white/80">Acessibilidade:</span>
        <button type="button" onClick={dec} className={btnBase} aria-label="Diminuir o tamanho do texto">
          A−
        </button>
        <button type="button" onClick={inc} className={btnBase} aria-label="Aumentar o tamanho do texto">
          A+
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={prefs.highContrast}
          className={prefs.highContrast ? btnActive : btnBase}
        >
          Alto contraste
        </button>
        <button type="button" onClick={reset} className={btnBase}>
          Repor
        </button>

        <span className="ml-3 font-bold text-white/80">Áudio:</span>
        <button
          type="button"
          onClick={() => setRateSafe(rate - RATE_STEP)}
          className={btnBase}
          aria-label="Abrandar a leitura"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="inline-block min-w-[38px] text-center text-xs font-bold text-white"
        >
          {formatRate(rate)}
        </span>
        <button
          type="button"
          onClick={() => setRateSafe(rate + RATE_STEP)}
          className={btnBase}
          aria-label="Acelerar a leitura"
        >
          +
        </button>
        <button
          type="button"
          onClick={stop}
          className={btnBase}
          aria-label="Parar a leitura em voz alta"
        >
          ⏹ Parar
        </button>
      </div>
    </div>
  );
}
