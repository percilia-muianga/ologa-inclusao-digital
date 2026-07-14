import { useEffect, useRef, useState } from "react";

/** Uma "fala" = uma utterance separada + o silêncio que se segue. */
export type Fala = { texto: string; pausaMs: number };

type Props = {
  /** Frases já divididas (compat). Cada uma é uma fala com pausa curta. */
  sentences?: string[];
  /** Devolve frases no momento do clique (compat). */
  getSentences?: () => string[];
  /** Devolve blocos estruturados (título/parágrafo/item) — preferido para conteúdo rico. */
  getFalas?: () => Fala[];
  label?: string;
  stopLabel?: string;
  variant?: "light" | "dark";
};

const RATE_STORAGE = "ologa-tts-rate";
const RATE_MIN = 0.75;
const RATE_MAX = 1.35;

/** Pausas — silêncio entre utterances. */
export const PAUSA_TITULO_MS = 700;
export const PAUSA_FRASE_MS = 350;
export const PAUSA_ITEM_MS = 350;

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
  const naturais = vozes.filter((v) =>
    /neural|natural|premium|enhanced|online/i.test(v.name),
  );
  const ptPt =
    naturais.find((v) => v.lang?.toLowerCase() === "pt-pt") ||
    vozes.find((v) => v.lang?.toLowerCase() === "pt-pt") ||
    null;
  return ptPt;
}

let jaAvisouSemPtPt = false;

export function ListenButton({
  sentences,
  getSentences,
  getFalas,
  label = "🔊 Ouvir",
  stopLabel = "⏹ Parar leitura",
  variant = "light",
}: Props) {
  const [aFalar, setAFalar] = useState(false);
  const canceladoRef = useRef(false);

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

    let falas: Fala[] = [];
    if (getFalas) {
      falas = getFalas().filter((f) => f.texto && f.texto.trim().length > 0);
    } else {
      const frases = (getSentences ? getSentences() : sentences ?? []).filter(
        (s) => s && s.trim().length > 0,
      );
      falas = frases.map((s) => ({ texto: s, pausaMs: PAUSA_FRASE_MS }));
    }
    if (falas.length === 0) return;

    window.speechSynthesis.cancel();
    canceladoRef.current = false;
    setAFalar(true);
    await garantirVozes();
    const voz = escolherVozPortuguesa();

    if (!voz && !jaAvisouSemPtPt) {
      jaAvisouSemPtPt = true;
      window.alert(
        "Este dispositivo não tem voz portuguesa de Portugal (pt-PT) instalada. Para manter o sotaque correto, instale uma voz pt-PT nas definições do sistema. A leitura em voz alta foi interrompida.",
      );
      setAFalar(false);
      return;
    }

    for (let i = 0; i < falas.length; i++) {
      if (canceladoRef.current) break;
      const fala = falas[i];
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(fala.texto);
        u.lang = "pt-PT";
        if (voz) u.voice = voz;
        u.rate = lerVelocidade();
        u.pitch = 1;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      });
      if (canceladoRef.current) break;
      if (i < falas.length - 1) {
        await new Promise((r) => setTimeout(r, fala.pausaMs));
      }
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

/** Divide texto em frases (mantém a pontuação final). */
function dividirFrases(texto: string): string[] {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (!limpo) return [];
  const partes = limpo
    .split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9«"'—])/u)
    .flatMap((p) =>
      p.length > 320 ? p.split(/(?<=[,;:])\s+/).map((x) => x.trim()) : [p.trim()],
    )
    .filter((p) => p.length > 0);
  return partes;
}

const IGNORAR = new Set([
  "SCRIPT",
  "STYLE",
  "NAV",
  "BUTTON",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "IMG",
  "PICTURE",
  "VIDEO",
  "AUDIO",
  "IFRAME",
  "FORM",
  "HEADER",
  "FOOTER",
]);

const CABECALHOS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const PARAGRAFOS = new Set(["P", "BLOCKQUOTE", "FIGCAPTION", "DT", "DD"]);

/**
 * Percorre o DOM e produz uma sequência de falas:
 * - cabeçalhos: 1 fala + pausa longa
 * - parágrafos: divididos em frases, pausa curta entre elas
 * - itens de lista: 1 fala por item, pausa curta
 * - SVG: lê o aria-label
 */
export function extrairFalasDeElemento(raiz: Element | null): Fala[] {
  if (!raiz) return [];
  const out: Fala[] = [];

  function push(texto: string, pausaMs: number) {
    const t = texto.replace(/\s+/g, " ").trim();
    if (t) out.push({ texto: t, pausaMs });
  }

  function visitar(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toUpperCase();
      if (IGNORAR.has(tag)) return;
      if (el.getAttribute("aria-hidden") === "true") return;
      if (el.getAttribute("data-tts-ignore") !== null) return;

      if (tag === "SVG") {
        const alvo = el.getAttribute("aria-label") || el.getAttribute("title");
        if (alvo) push(alvo, PAUSA_FRASE_MS);
        return;
      }

      if (CABECALHOS.has(tag)) {
        push(el.textContent ?? "", PAUSA_TITULO_MS);
        return;
      }

      if (PARAGRAFOS.has(tag)) {
        const frases = dividirFrases(el.textContent ?? "");
        for (let i = 0; i < frases.length; i++) {
          push(frases[i], PAUSA_FRASE_MS);
        }
        return;
      }

      if (tag === "LI") {
        // Lê o item inteiro como uma fala (mais natural do que quebrar por frases).
        push(el.textContent ?? "", PAUSA_ITEM_MS);
        return;
      }

      // Contentor genérico — descer aos filhos.
      for (const filho of Array.from(el.childNodes)) visitar(filho);
    }
    // Ignorar nós de texto soltos entre blocos — o conteúdo real vem dos blocos.
  }

  visitar(raiz);
  return out;
}

/** Versão a partir de HTML em string (usada pelos separadores das lições). */
export function extrairFalasDeHtml(html: string): Fala[] {
  if (typeof window === "undefined" || !html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return extrairFalasDeElemento(doc.body);
}

/** Compat: mantém a assinatura antiga (frases planas) para chamadores que ainda não migraram. */
export function extrairFrasesDeHtml(html: string): string[] {
  return extrairFalasDeHtml(html).map((f) => f.texto);
}
