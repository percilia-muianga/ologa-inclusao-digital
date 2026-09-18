import { useRef, type ReactNode } from "react";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

type Props = {
  titulo: string;
  introducao?: string;
  children: ReactNode;
};

/**
 * Estrutura comum a todos os ecrãs da plataforma: saltar para o conteúdo,
 * navegação, leitura em voz alta e rodapé. A barra de acessibilidade e o
 * alto contraste são globais (ver __root).
 */
export function PlataformaPagina({ titulo, introducao, children }: Props) {
  const conteudoRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo" className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6">
        <div ref={conteudoRef}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">{titulo}</h1>
              {introducao ? (
                <p className="mt-3 text-base text-navy-2">{introducao}</p>
              ) : null}
            </div>
            <ListenButton
              label="🔊 Ouvir esta página"
              getFalas={() => extrairFalasDeElemento(conteudoRef.current)}
            />
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <PlataformaFooter />
    </>
  );
}

/** Estado vazio digno: nunca um ecrã em branco. */
export function EstadoVazio({
  titulo,
  descricao,
  accao,
}: {
  titulo: string;
  descricao: string;
  accao?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-lg border border-dashed border-line bg-page px-5 py-8 text-center"
    >
      <p className="text-lg font-bold text-navy">{titulo}</p>
      <p className="mx-auto mt-2 max-w-2xl text-base text-navy-2">{descricao}</p>
      {accao ? <div className="mt-5 flex justify-center">{accao}</div> : null}
    </div>
  );
}
