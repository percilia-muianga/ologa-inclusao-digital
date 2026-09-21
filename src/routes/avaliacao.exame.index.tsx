import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  estadoAvaliacaoFormando,
  iniciarExame,
  referenciasBanco,
} from "@/lib/avaliacao.functions";
import { formacaoStore } from "@/lib/formacao-store";
import { PlataformaPagina } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/avaliacao/exame/")({
  component: IniciarExamePage,
});

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";

const ERROS: Record<string, string> = {
  TOKEN_INVALIDO:
    "Não encontrámos nenhum formando com esse código pessoal. Confirme o código que recebeu ao concluir um módulo.",
  BANCO_INSUFICIENTE:
    "Este curso ainda não tem questões activas suficientes para gerar o exame. Fale com a coordenação.",
  TENTATIVAS_ESGOTADAS:
    "Já utilizou as duas tentativas permitidas para este curso.",
};

function IniciarExamePage() {
  const navigate = useNavigate();
  const carregarRefs = useServerFn(referenciasBanco);
  const carregarEstado = useServerFn(estadoAvaliacaoFormando);
  const iniciar = useServerFn(iniciarExame);

  const [token, setToken] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aIniciar, setAIniciar] = useState(false);

  useEffect(() => {
    const guardado = formacaoStore.token();
    if (guardado) setToken(guardado);
  }, []);

  const refs = useQuery({ queryKey: ["refs-banco"], queryFn: () => carregarRefs() });

  const estado = useQuery({
    queryKey: ["estado-avaliacao", token, cursoId],
    enabled: token.length > 20 && cursoId.length > 0,
    queryFn: () => carregarEstado({ data: { token, cursoId } }),
    retry: false,
  });

  async function comecar() {
    setErro(null);
    setAIniciar(true);
    try {
      const r = await iniciar({ data: { token: token.trim(), cursoId } });
      await navigate({ to: "/avaliacao/exame/$tentativa", params: { tentativa: r.tentativaId } });
    } catch (e) {
      const msg = (e as Error).message;
      setErro(ERROS[msg] ?? `Não foi possível iniciar o exame: ${msg}`);
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
        <div>
          <label className="block text-sm font-semibold text-navy-2" htmlFor="token">
            O seu código pessoal de formando
          </label>
          <input
            id="token"
            className={campo}
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            autoComplete="off"
            spellCheck={false}
            required
          />
          <p className="mt-1 text-sm text-navy-2">
            É o código que recebeu quando concluiu um módulo nesta plataforma.
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy-2" htmlFor="curso">
            Curso a avaliar
          </label>
          <select
            id="curso"
            className={campo}
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            required
          >
            <option value="">Escolha o curso</option>
            {(refs.data?.cursos ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </div>

        <div role="status" aria-live="polite" className="grid gap-2 text-base text-navy">
          {estado.isError ? (
            <p>
              Não conseguimos confirmar o seu código pessoal. Verifique-o e tente novamente.
            </p>
          ) : null}
          {estado.data ? (
            <>
              <p>
                Tentativas já utilizadas: {estado.data.tentativas.length} de{" "}
                {estado.data.tentativasMax}.
              </p>
              <p>
                {estado.data.diasRestantes === null
                  ? "Ainda não há data de fim da formação registada, por isso o prazo de 30 dias ainda não começou a contar."
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
          disabled={aIniciar || !cursoId || token.length < 10}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground disabled:opacity-60"
        >
          {aIniciar ? "A preparar o exame…" : "Iniciar exame"}
        </button>
      </form>
    </PlataformaPagina>
  );
}
