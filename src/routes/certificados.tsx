import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { emitirCertificadoCurso, estadoAvaliacaoFormando } from "@/lib/avaliacao.functions";
import { SeletorMatricula } from "@/components/seletor-matricula";
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

const ERROS_CERT: Record<string, string> = {
  MATRICULA_INVALIDA: "Esta turma não está associada à sua conta.",
  INSCRICAO_INACTIVA: "A sua inscrição nesta turma não está activa.",
  SEM_EXAME_SUBMETIDO: "Ainda não tem nenhum exame final submetido nesta turma.",
  NOTA_INSUFICIENTE: "A nota final ainda não atinge o limiar exigido.",
  ASSIDUIDADE_INSUFICIENTE: "A assiduidade ainda não atinge o limiar exigido.",
  EXAME_NAO_CONFIGURADO: "A avaliação final deste curso ainda não está disponível.",
};

function CertificadosPage() {
  const carregarEstado = useServerFn(estadoAvaliacaoFormando);
  const emitir = useServerFn(emitirCertificadoCurso);

  const [inscricaoId, setInscricaoId] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);

  const estado = useQuery({
    queryKey: ["estado-avaliacao", inscricaoId],
    enabled: inscricaoId.length > 0,
    retry: false,
    queryFn: () => carregarEstado({ data: { inscricaoId } }),
  });

  async function pedirCertificado() {
    setMensagem(null);
    try {
      const r = await emitir({ data: { inscricaoId } });
      setMensagem(`Certificado emitido. Código de verificação: ${r.codigo_verificacao}`);
      await estado.refetch();
    } catch (e) {
      const m = (e as Error).message;
      setMensagem(ERROS_CERT[m] ?? "Não foi possível emitir o certificado. Tente de novo mais tarde.");
    }
  }

  const d = estado.data;

  return (
    <PlataformaPagina
      titulo="Certificados"
      introducao="O certificado é individual, por formando e por curso. Exige duas condições cumulativas: assiduidade igual ou superior a 80 por cento e nota final igual ou superior a 60 por cento. As duas são sempre mostradas em separado, com o valor atingido e o limiar."
    >
      <div className="mb-6 grid max-w-2xl gap-4 rounded-lg border border-line bg-white p-5">
        <SeletorMatricula valor={inscricaoId} aoMudar={setInscricaoId} />
      </div>

      <div role="status" aria-live="polite" className="mb-6 text-base text-navy">
        {estado.isError ? (
          <p>Não conseguimos confirmar esta turma na sua conta.</p>
        ) : null}
        {mensagem ? <p className="font-semibold">{mensagem}</p> : null}
      </div>

      {!d ? (
        <EstadoVazio
          titulo="Escolha a sua turma"
          descricao="Mostramos a sua nota final, a sua assiduidade, os dias que faltam para o prazo e, se as duas condições estiverem cumpridas, emitimos o certificado."
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
              Assiduidade estrita:{" "}
              {d.assiduidadeEstritaPct === null ? "por apurar" : `${d.assiduidadeEstritaPct}%`} —
              sessões presentes a dividir pelas sessões realizadas, com as faltas justificadas a
              contar como ausência.
            </p>
            <p className="mt-1 text-base text-navy">
              Assiduidade ajustada:{" "}
              {d.assiduidadeAjustadaPct === null ? "por apurar" : `${d.assiduidadeAjustadaPct}%`} —
              sessões presentes a dividir pelas sessões realizadas menos as{" "}
              {d.faltasJustificadas} faltas justificadas, que saem do denominador.
            </p>
            <p className="mt-2 text-base text-navy">
              Neste curso, a taxa que vale para certificação é a{" "}
              {d.baseAssiduidade === "ajustada" ? "ajustada" : "estrita"}. Limiar exigido:{" "}
              {d.assiduidadeMinimaPct}%.
            </p>
            <p className="mt-1 text-base font-semibold text-navy">
              {d.assiduidadePct === null
                ? "Por apurar: a sua turma ainda não tem sessões marcadas como realizadas com presenças registadas."
                : d.assiduidadePct >= d.assiduidadeMinimaPct
                  ? `Condição cumprida, com ${d.assiduidadePct}%.`
                  : `Condição não cumprida, com ${d.assiduidadePct}%.`}
            </p>
          </section>


          <section className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-navy">Tentativas e prazo</h2>
            <p className="mt-2 text-base text-navy">
              Tentativas utilizadas nesta turma: {d.tentativas.length} de {d.tentativasMax}. Cada nova
              tentativa gera um exame novo da mesma maneira.
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
                search={{ inscricao: inscricaoId }}
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
                O certificado só pode ser emitido depois de as presenças estarem marcadas. Fale com
                a coordenação da sua turma.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void pedirCertificado()}
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
