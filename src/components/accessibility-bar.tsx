import { useEffect, useState } from "react";

const STORAGE_KEY = "ologa-a11y";
const STEP = 0.1;
const MIN = 0.85;
const MAX = 1.4;

type Prefs = { scale: number; highContrast: boolean };

function apply(prefs: Prefs) {
  const root = document.documentElement;
  root.style.setProperty("--a11y-scale", String(prefs.scale));
  root.classList.toggle("high-contrast", prefs.highContrast);
}

export function AccessibilityBar() {
  const [prefs, setPrefs] = useState<Prefs>({ scale: 1, highContrast: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Prefs;
        setPrefs(parsed);
        apply(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = (next: Prefs) => {
    setPrefs(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const dec = () =>
    update({ ...prefs, scale: Math.max(MIN, Math.round((prefs.scale - STEP) * 100) / 100) });
  const inc = () =>
    update({ ...prefs, scale: Math.min(MAX, Math.round((prefs.scale + STEP) * 100) / 100) });
  const toggle = () => update({ ...prefs, highContrast: !prefs.highContrast });
  const reset = () => update({ scale: 1, highContrast: false });

  const btn =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/20 bg-white/5 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:bg-white/15";

  return (
    <div className="bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <span className="mr-1 text-sm font-semibold">Acessibilidade:</span>
        <button type="button" onClick={dec} className={btn} aria-label="Diminuir tamanho do texto">
          A−
        </button>
        <button type="button" onClick={inc} className={btn} aria-label="Aumentar tamanho do texto">
          A+
        </button>
        <button
          type="button"
          onClick={toggle}
          className={btn}
          aria-pressed={prefs.highContrast}
        >
          Alto contraste
        </button>
        <button type="button" onClick={reset} className={btn}>
          Repor
        </button>
      </div>
    </div>
  );
}
