import { useEffect, useState } from "react";

export function BackToTop() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visivel) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      aria-label="Voltar ao topo da página"
      className="fixed bottom-4 right-4 z-40 inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-navy/20 bg-white/95 px-3 py-2 text-sm font-bold text-navy shadow-lg backdrop-blur transition-colors hover:bg-page focus-visible:bg-page sm:bottom-6 sm:right-6"
    >
      <span aria-hidden="true">↑</span>
      <span className="hidden sm:inline">Voltar ao topo</span>
    </button>
  );
}
