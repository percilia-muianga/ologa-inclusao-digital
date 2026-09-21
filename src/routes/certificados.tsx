import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  emitirCertificadoCurso,
  estadoAvaliacaoFormando,
  referenciasBanco,
} from "@/lib/avaliacao.functions";
import { formacaoStore } from "@/lib/formacao-store";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/certificados")({
  head: () => ({
    meta: [
      { title: "Certificados — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Certificado individual por formando e por curso, com nota final, assiduidade e código único de verificação.",
      },
      { property: "og:title", content: "Certificados — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Certificação com assiduidade igual ou superior a oitenta por cento e nota final igual ou superior a sessenta por cento, mostradas separadamente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CertificadosPage,
});

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";

function CertificadosPage() {
  const carregarRefs = useServerFn(referenciasBanco);
  const carregarEstado = useServerFn(estadoAvaliacaoFormando);
  const emitir = useServerFn(emitirCertificadoCurso);

  const [token, setToken] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    const guardado = formacaoStore.token();
    if (guardado) setToken(guardado);
  }, []);

  const refs = useQuery({ queryKey: ["refs-banco"], queryFn: () => carregarRefs() });
  const estado = useQuery({
    queryKey: ["estado-avaliacao", token, cursoId],
    enabled: token.length > 20 && cursoId.length > 0,
    retry: false,
    queryFn: () => carregarEstado({ data: { token, cursoId } }),
  });

  async function pedirCertificado() {
    setMensagem(null);
    try {
      const r = await emitir({ data: { token, cursoId } });
      setMensagem(`Certificado emitido. Código de verificação: ${r.codigo_verificacao}`);
      await estado.refetch();
    } catch (e) {
      setMensagem(`Não foi possível emitir o certificado: ${(e as Error).message}`);
    }
  }

  const d = estado.data;

  return (
    <PlataformaPagina
      titulo="Certificados"
      introducao="O certificado é individual, por formando e por curso. Exige duas condições cumulativas: assiduidade igual ou superior a 80 por cento e nota final igual ou superior a 60 por cento. As duas são sempre mostradas em separado, com o valor atingido e o limiar."
    >
      <form className="mb-6 grid max-w-2xl gap-4 rounded-lg border border-line bg-white p-5">
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
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy-2" htmlFor="curso">
            Curso
          </label>
          <select
            id="curso"
            className={campo}
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
          >
            <option value="">Escolha o curso</option>
            {(refs.data?.cursos ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div role="status" aria-live="polite" className="mb-6 text-base text-navy">
        {estado.isError ? (
          <p>Não conseguimos confirmar o seu código pessoal. Verifique-o e tente de novo.</p>
        ) : null}
        {mensagem ? <p className="font-semibold">{mensagem}</p> : null}
      </div>

      {!d ? (
        <EstadoVazio
          titulo="Escreva o seu código pessoal e escolha o curso"
          descricao="Com esses dois dados mostramos a sua nota final, a sua assiduidade, os dias que faltam para o prazo e, se as duas condições estiverem cumpridas, emitimos o certificado."
          accao={
            <Link
              to="/verificar"
              className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
            >
              Verificar um certificado
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-navy">Condição 1 — Nota final</h2>
            <p className="mt-2 text-base text-navy">
              {d.melhorNota === null
                ? "Ainda não tem nenhum exame final submetido."
                : `Nota obtida: ${d.melhorNota}%.`}{" "}
              Limiar exigido: {d.notaMinimaPct}%.
            </p>
            <p className="mt-1 text-base font-semibold text-navy">
              {d.melhorNota === null
                ? "Por avaliar"
                : d.melhorNota >= d.notaMinimaPct
                  ? "Condição cumprida"
                  : "Condição não cumprida"}
            </p>
          </section>

          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-navy">Condição 2 — Assiduidade</h2>
            <p className="mt-2 text-base text-navy">
              {d.assiduidadePct === null
                ? "Assiduidade por apurar: a marcação de presenças por sessão ainda não está em funcionamento na plataforma."
                : `Assiduidade registada: ${d.assiduidadePct}%.`}{" "}
              Limiar exigido: {d.assiduidadeMinimaPct}%.
            </p>
            <p className="mt-1 text-base font-semibold text-navy">
              {d.assiduidadePct === null
                ? "Por apurar"
                : d.assiduidadePct >= d.assiduidadeMinimaPct
                  ? "Condição cumprida"
                  : "Condição não cumprida"}
            </p>
          </section>

          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-navy">Tentativas e prazo</h2>
            <p className="mt-2 text-base text-navy">
              Tentativas utilizadas: {d.tentativas.length} de {d.tentativasMax}. É permitida uma
              segunda tentativa, com exame novo gerado da mesma maneira.
            </p>
            <p className="mt-1 text-base text-navy">
              {d.diasRestantes === null
                ? `O prazo de ${d.prazoDias} dias conta a partir do fim da formação; a sua turma ainda não tem data de fim registada.`
                : d.diasRestantes >= 0
                  ? `Faltam ${d.diasRestantes} dias para terminar o prazo de ${d.prazoDias} dias após o fim da formação.`
                  : `O prazo de ${d.prazoDias} dias após o fim da formação já terminou.`}
            </p>
            {d.tentativas.length < d.tentativasMax ? (
              <Link
                to="/avaliacao/exame"
                className="mt-3 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
              >
                Ir para o exame final
              </Link>
            ) : null}
          </section>

          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-navy">Certificado</h2>
            {d.certificado ? (
              <>
                <p className="mt-2 text-base text-navy">
                  Certificado emitido em{" "}
                  {new Date(d.certificado.emitido_em).toLocaleDateString("pt-PT")}. Nota final:{" "}
                  {String(d.certificado.nota_final_pct)}%. Assiduidade:{" "}
                  {String(d.certificado.assiduidade_pct)}%.
                </p>
                <p className="mt-1 text-base font-semibold text-navy">
                  Código de verificação: {d.certificado.codigo_verificacao}
                </p>
                <Link
                  to="/verificar"
                  className="mt-3 inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
                >
                  Verificar este certificado
                </Link>
              </>
            ) : d.assiduidadePct === null ? (
              <p className="mt-2 text-base text-navy">
                O certificado só pode ser emitido depois de a assiduidade estar registada. Fale com
                a coordenação da sua turma.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void pedirCertificado(d.assiduidadePct!)}
                className="mt-3 inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
              >
                Emitir certificado
              </button>
            )}
            <p className="mt-4 text-sm text-navy-2">
              Este documento atesta a formação realizada. Não constitui certificação de
              conformidade legal.
            </p>
          </section>
        </div>
      )}
    </PlataformaPagina>
  );
}
