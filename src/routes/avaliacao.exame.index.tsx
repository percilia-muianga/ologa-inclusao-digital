import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { estadoAvaliacaoFormando, iniciarExame } from "@/lib/avaliacao.functions";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { SeletorMatricula } from "@/components/seletor-matricula";

export const Route = createFileRoute("/avaliacao/exame/")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ inscricao: z.string().uuid().optional().catch(undefined) }).parse(s),
  component: IniciarExamePage,
});

export const ERROS_EXAME: Record<string, string> = {
  MATRICULA_INVALIDA: "Esta turma não está associada à sua conta.",
  INSCRICAO_INACTIVA: "A sua inscrição nesta turma não está activa.",
  EXAME_NAO_CONFIGURADO:
    "O exame final deste curso ainda não está disponível. Será avisado(a) pela equipa de formação.",
  BANCO_INSUFICIENTE:
    "O exame final deste curso ainda não está disponível. Os exames ficam disponíveis após a activação das questões e da configuração necessária.",
  TENTATIVAS_ESGOTADAS: "Já utilizou todas as tentativas permitidas nesta turma.",
  PRAZO_EXPIRADO:
    "O prazo para fazer o exame terminou. Conta-se em dias de calendário a partir do fim da formação da sua turma. Fale com a coordenação.",
};

function IniciarExamePage() {
  const navigate = useNavigate();
  const { inscricao } = Route.useSearch();
  const carregarEstado = useServerFn(estadoAvaliacaoFormando);
  const iniciar = useServerFn(iniciarExame);

  const [inscricaoId, setInscricaoId] = useState(inscricao ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [aIniciar, setAIniciar] = useState(false);

  const estado = useQuery({
    queryKey: ["estado-avaliacao", inscricaoId],
    enabled: inscricaoId.length > 0,
    queryFn: () => carregarEstado({ data: { inscricaoId } }),
    retry: false,
  });

  async function comecar() {
    setErro(null);
    setAIniciar(true);
    try {
      const r = await iniciar({ data: { inscricaoId } });
      await navigate({ to: "/avaliacao/exame/$tentativa", params: { tentativa: r.tentativaId } });
    } catch (e) {
      const msg = (e as Error).message;
      setErro(ERROS_EXAME[msg] ?? "Não foi possível iniciar o exame. Tente de novo mais tarde.");
    } finally {
      setAIniciar(false);
    }
  }

  return (
    <PlataformaPagina
      titulo="Exame final"
      introducao="O exame é gerado no momento em que o inicia. As questões e as opções aparecem por ordem aleatória, há tempo limite e as respostas gravam-se à medida que as dá. Se a ligação cair, volta ao mesmo exame com o tempo já decorrido contado."
    >
      <form
        className="grid max-w-2xl gap-4 rounded-lg border border-line bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void comecar();
        }}
      >
        <SeletorMatricula valor={inscricaoId} aoMudar={setInscricaoId} />

        <div role="status" aria-live="polite" className="grid gap-2 text-base text-navy">
          {estado.isError ? <p>Não conseguimos confirmar esta turma na sua conta.</p> : null}
          {estado.data ? (
            <>
              <p>
                Tentativas já utilizadas nesta turma: {estado.data.tentativas.length} de{" "}
                {estado.data.tentativasMax}.
              </p>
              <p>
                {estado.data.diasRestantes === null
                  ? `Ainda não há data de fim da formação registada, por isso o prazo de ${estado.data.prazoDias} dias ainda não começou a contar.`
                  : estado.data.diasRestantes >= 0
                    ? `Faltam ${estado.data.diasRestantes} dias para terminar o prazo de ${estado.data.prazoDias} dias após o fim da formação.`
                    : `O prazo de ${estado.data.prazoDias} dias após o fim da formação já terminou.`}
              </p>
              <p>Tempo do exame: {estado.data.minutos} minutos.</p>
            </>
          ) : null}
          {erro ? <p className="font-semibold text-[#C20400]">{erro}</p> : null}
        </div>

        <button
          type="submit"
          disabled={aIniciar || !inscricaoId}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground disabled:opacity-60"
        >
          {aIniciar ? "A preparar o exame…" : "Iniciar exame"}
        </button>
      </form>
    </PlataformaPagina>
  );
}
