import { useEffect, useRef, useState } from "react";

type Props = {
  /** Frases já divididas. Alternativa a `getSentences`. */
  sentences?: string[];
  /** Devolve frases no momento do clique — útil quando o conteúdo muda (separadores). */
  getSentences?: () => string[];
  label?: string;
  stopLabel?: string;
  variant?: "light" | "dark";
};

const RATE_STORAGE = "ologa-tts-rate";
const RATE_MIN = 0.75;
const RATE_MAX = 1.35;
const PAUSA_ENTRE_FRASES_MS = 380;

function lerVelocidade(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(RATE_STORAGE);
    if (!raw) return 1;
    const n = Number(raw);
    if (!Number.isFinite(n)) return 1;
    return Math.max(RATE_MIN, Math.min(RATE_MAX, n));
  } catch {
    return 1;
  }
}

function escolherVozPortuguesa() {
  const vozes = window.speechSynthesis.getVoices();
  // Preferir vozes marcadas como naturais/premium quando existam
  const naturais = vozes.filter((v) =>
    /neural|natural|premium|enhanced|online/i.test(v.name),
  );
  return (
    naturais.find((v) => v.lang?.toLowerCase() === "pt-pt") ||
    vozes.find((v) => v.lang?.toLowerCase() === "pt-pt") ||
    naturais.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
    vozes.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
    null
  );
}

export function ListenButton({
  sentences,
  getSentences,
  label = "🔊 Ouvir",
  stopLabel = "⏹ Parar leitura",
  variant = "light",
}: Props) {
  const [aFalar, setAFalar] = useState(false);
  const canceladoRef = useRef(false);

  // Parar quando o componente desmontar (mudar de lição, fechar diálogo, etc.)
  useEffect(() => {
    return () => {
      canceladoRef.current = true;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function garantirVozes() {
    if (window.speechSynthesis.getVoices().length > 0) return;
    await new Promise<void>((resolve) => {
      const h = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", h);
        resolve();
      };
      window.speechSynthesis.addEventListener("voiceschanged", h);
      setTimeout(resolve, 600);
    });
  }

  async function ler() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const frases = (getSentences ? getSentences() : sentences ?? []).filter(
      (s) => s && s.trim().length > 0,
    );
    if (frases.length === 0) return;

    window.speechSynthesis.cancel();
    canceladoRef.current = false;
    setAFalar(true);
    await garantirVozes();
    const voz = escolherVozPortuguesa();

    for (const frase of frases) {
      if (canceladoRef.current) break;
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(frase);
        u.lang = "pt-PT";
        if (voz) u.voice = voz;
        u.rate = lerVelocidade(); // relido a cada frase — apanha alterações na barra
        u.pitch = 1;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      });
      if (canceladoRef.current) break;
      await new Promise((r) => setTimeout(r, PAUSA_ENTRE_FRASES_MS));
    }
    setAFalar(false);
  }

  function parar() {
    canceladoRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAFalar(false);
  }

  const className =
    variant === "dark"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/25 focus-visible:bg-white/25"
      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/20 bg-white px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-page focus-visible:bg-page";

  return (
    <button
      type="button"
      onClick={aFalar ? parar : ler}
      aria-pressed={aFalar}
      aria-label={aFalar ? stopLabel : `${label} — usa a velocidade definida na barra de acessibilidade`}
      className={className}
    >
      {aFalar ? stopLabel : label}
    </button>
  );
}

/** Extrai frases de um bloco HTML — usado nos separadores das lições. */
export function extrairFrasesDeHtml(html: string): string[] {
  if (typeof window === "undefined" || !html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Remover elementos que não devem ser lidos
  doc.querySelectorAll("script,style,svg").forEach((el) => el.remove());
  const texto = (doc.body.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!texto) return [];
  // Dividir por pontuação final, mantendo o sinal
  const partes = texto
    .split(/(?<=[.!?…:])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9«"'])/u)
    .flatMap((p) => (p.length > 320 ? p.split(/(?<=[,;])\s+/) : [p]))
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return partes;
}
