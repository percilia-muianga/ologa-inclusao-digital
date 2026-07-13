import { useEffect, useRef, useState } from "react";

type Props = {
  sentences: string[];
  label?: string;
  stopLabel?: string;
  variant?: "light" | "dark";
};

export function ListenButton({
  sentences,
  label = "🔊 Ouvir esta página",
  stopLabel = "⏹ Parar leitura",
  variant = "light",
}: Props) {
  const [speaking, setSpeaking] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang?.toLowerCase() === "pt-pt") ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("pt")) ||
      null
    );
  };

  const speakSequence = async () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    cancelledRef.current = false;
    setSpeaking(true);

    // Ensure voices are loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        const handler = () => {
          window.speechSynthesis.removeEventListener("voiceschanged", handler);
          resolve();
        };
        window.speechSynthesis.addEventListener("voiceschanged", handler);
        setTimeout(resolve, 500);
      });
    }
    const voice = pickVoice();

    for (const sentence of sentences) {
      if (cancelledRef.current) break;
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(sentence);
        u.lang = "pt-PT";
        if (voice) u.voice = voice;
        u.rate = 0.85;
        u.pitch = 1;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      });
      if (cancelledRef.current) break;
      // Pausa entre frases
      await new Promise((r) => setTimeout(r, 450));
    }
    setSpeaking(false);
  };

  const stop = () => {
    cancelledRef.current = true;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <button
      type="button"
      onClick={speaking ? stop : speakSequence}
      aria-pressed={speaking}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/20 bg-white px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-accent"
    >
      {speaking ? stopLabel : label}
    </button>
  );
}
