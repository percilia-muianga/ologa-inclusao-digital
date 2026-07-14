import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  obterIndicadoresPorToken,
  type PainelIndicadores,
} from "@/lib/indicadores-instituicao.functions";
import { ListenButton } from "@/components/listen-button";


export const Route = createFileRoute("/indicadores/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Indicadores da instituição — Ologa" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: IndicadoresPage,
});

type Estado =
  | { tipo: "a_carregar" }
  | { tipo: "invalido" }
  | { tipo: "erro" }
  | { tipo: "ok"; painel: PainelIndicadores };

function IndicadoresPage() {
  const { token } = Route.useParams();
  const obter = useServerFn(obterIndicadoresPorToken);
  const [estado, setEstado] = useState<Estado>({ tipo: "a_carregar" });

  useEffect(() => {
    // Não deixar o token entrar no title da aba, event tracking, nem em headers de referrer.
    document.title = "Indicadores da instituição — Ologa";
    let cancelado = false;
    obter({ data: { token } })
      .then((res) => {
        if (cancelado) return;
        if (!res.ok) {
          setEstado({ tipo: res.mensagem === "nao_encontrada" ? "invalido" : "erro" });
        } else {
          setEstado({ tipo: "ok", painel: res.painel });
        }
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "erro" });
      });
    return () => {
      cancelado = true;
    };
  }, [token, obter]);

  if (estado.tipo === "a_carregar") {
    return (
      <main id="conteudo" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p role="status" aria-live="polite" className="text-base text-foreground">
          A carregar indicadores…
        </p>
      </main>
    );
  }

  if (estado.tipo === "invalido") {
    return (
      <main id="conteudo" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-extrabold text-ink">Link inválido</h1>
        <p className="mt-4 text-base text-foreground">
          Este link não corresponde a nenhum painel activo.
        </p>
      </main>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <main id="conteudo" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-extrabold text-ink">Não foi possível carregar</h1>
        <p className="mt-4 text-base text-foreground">
          Ocorreu um erro. Tente novamente daqui a instantes.
        </p>
      </main>
    );
  }

  const p = estado.painel;
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink/60">
            Painel de indicadores
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
            {p.instituicao.nome}
          </h1>
          <p className="mt-2 text-sm text-foreground">
            {[p.instituicao.distrito, p.instituicao.provincia].filter(Boolean).join(", ") ||
              "Localização não indicada"}
            {p.instituicao.prazo_meses
              ? ` · Prazo acordado: ${p.instituicao.prazo_meses} meses`
              : ""}
          </p>
        </header>

        <section aria-label="Totais" className="mt-8 grid gap-4 sm:grid-cols-3">
          <Total titulo="Trabalhadores no total" valor={p.instituicao.num_trabalhadores_total} />
          <Total titulo="Formandos inscritos" valor={p.totais.inscritos} />
          <Total titulo="Formandos certificados" valor={p.totais.certificados} />
        </section>

        <section aria-label="Indicadores" className="mt-10 grid gap-4">
          <IndicadorCartao
            n={1}
            nome="Cobertura"
            unidade="%"
            real={p.cobertura.disponivel ? p.cobertura.real_pct : null}
            meta={p.cobertura.meta_pct}
            prazoMeses={p.instituicao.prazo_meses}
            regra="maior_melhor"
          />
          <IndicadorCartao
            n={2}
            nome="Conclusão"
            unidade="%"
            real={p.conclusao.disponivel ? p.conclusao.real_pct : null}
            meta={p.conclusao.meta_pct}
            prazoMeses={p.instituicao.prazo_meses}
            regra="maior_melhor"
          />
          <IndicadorCartao
            n={3}
            nome="Ganho"
            unidade="pontos"
            real={p.ganho.disponivel ? p.ganho.real_pontos : null}
            meta={p.ganho.meta_pontos}
            prazoMeses={p.instituicao.prazo_meses}
            regra="maior_melhor"
            legenda={`Calculado apenas sobre os formandos que fizeram o diagnóstico inicial (N=${p.ganho.n}).`}
          />
          <IndicadorCartao
            n={4}
            nome="Equidade"
            unidade="pp"
            real={p.equidade.disponivel ? p.equidade.dif_maxima_pp : null}
            meta={p.equidade.meta_max_pp}
            prazoMeses={p.instituicao.prazo_meses}
            regra="menor_melhor"
            legenda={
              !p.equidade.disponivel
                ? "Ainda sem dados suficientes para comparar grupos (mínimo de 5 formandos por grupo)."
                : "Diferença máxima entre a taxa de conclusão de grupos comparáveis (sexo e/ou necessidade de apoio)."
            }
          />
          <CompromissoCartao
            assinada={p.compromisso.declaracao_assinada}
            assinadaEm={p.compromisso.assinada_em}
          />
        </section>

        <section aria-label="Certificados emitidos" className="mt-12">
          <h2 className="text-2xl font-bold text-ink">Certificados emitidos</h2>
          {p.certificados_lista.length === 0 ? (
            <p className="mt-4 text-base text-foreground">Ainda sem dados.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-md border border-ink/10">
              <table className="w-full text-left text-base">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-ink">Nome</th>
                    <th className="px-4 py-2 font-semibold text-ink">Módulo</th>
                    <th className="px-4 py-2 font-semibold text-ink">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {p.certificados_lista.map((c, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-ink">{c.nome}</td>
                      <td className="px-4 py-2 text-ink">{c.modulo}</td>
                      <td className="px-4 py-2 text-ink">
                        {new Date(c.data).toLocaleDateString("pt-PT")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-label="Documentos" className="mt-12">
          <h2 className="text-2xl font-bold text-ink">Documentos</h2>
          <p className="mt-2 text-sm text-foreground">
            Cada documento é gerado a partir dos dados registados na plataforma. Atestam a formação
            realizada. Não constituem certificação de conformidade legal.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            <LinkDoc token={token} tipo="relatorio" nome="Relatório de capacitação" />
            <LinkDoc token={token} tipo="certificado" nome="Certificado da instituição" />
            <LinkDoc
              token={token}
              tipo="declaracao"
              nome="Declaração de desenho universal"
              nota="Ao gerar, a declaração fica registada como assinada."
            />
          </ul>
        </section>
      </main>
    </>
  );
}

function LinkDoc({
  token,
  tipo,
  nome,
  nota,
}: {
  token: string;
  tipo: "relatorio" | "certificado" | "declaracao";
  nome: string;
  nota?: string;
}) {
  const href = `/api/public/documentos/${tipo}/${token}`;
  return (
    <li className="rounded-md border border-ink/10 bg-white p-4">
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="text-base font-semibold text-brand-dark underline"
      >
        {nome} (PDF)
      </a>
      {nota && <p className="mt-2 text-xs text-ink/60">{nota}</p>}
    </li>
  );
}

function Total({ titulo, valor }: { titulo: string; valor: number | null }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/60">
        {titulo}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-ink">
        {valor == null ? "—" : valor}
      </p>
    </div>
  );
}

type EstadoInd = "cumprida" | "em_curso" | "abaixo" | "sem_dados" | "sem_meta";

function calcularEstado(
  real: number | null,
  meta: number | null,
  regra: "maior_melhor" | "menor_melhor",
): EstadoInd {
  if (real == null) return "sem_dados";
  if (meta == null) return "sem_meta";
  const cumprimento =
    regra === "maior_melhor" ? real / meta : meta === 0 ? (real === 0 ? 1 : 0) : meta / real;
  if (cumprimento >= 1) return "cumprida";
  if (cumprimento >= 0.7) return "em_curso";
  return "abaixo";
}

function IndicadorCartao(props: {
  n: number;
  nome: string;
  unidade: string;
  real: number | null;
  meta: number | null;
  prazoMeses: number | null;
  regra: "maior_melhor" | "menor_melhor";
  legenda?: string;
}) {
  const est = calcularEstado(props.real, props.meta, props.regra);
  const cumprimento =
    props.real != null && props.meta != null
      ? props.regra === "maior_melhor"
        ? Math.round((props.real / props.meta) * 100)
        : props.meta === 0
          ? props.real === 0
            ? 100
            : 0
          : Math.round((props.meta / props.real) * 100)
      : null;

  return (
    <article className="rounded-md border border-ink/10 bg-white p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-bold text-ink">
          {props.n}. {props.nome}
        </h3>
        <EstadoEtiqueta estado={est} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Bloco rot="Real" val={fmt(props.real, props.unidade)} />
        <Bloco rot="Meta" val={fmt(props.meta, props.unidade)} />
        <Bloco
          rot="Cumprimento"
          val={cumprimento == null ? "—" : `${cumprimento}%`}
        />
        <Bloco
          rot="Prazo"
          val={props.prazoMeses ? `${props.prazoMeses} meses` : "—"}
        />
      </dl>
      {props.legenda && (
        <p className="mt-3 text-xs text-ink/70">{props.legenda}</p>
      )}
    </article>
  );
}

function CompromissoCartao({
  assinada,
  assinadaEm,
}: {
  assinada: boolean;
  assinadaEm: string | null;
}) {
  const est: EstadoInd = assinada ? "cumprida" : "abaixo";
  return (
    <article className="rounded-md border border-ink/10 bg-white p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-bold text-ink">5. Compromisso</h3>
        <EstadoEtiqueta estado={est} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Bloco rot="Real" val={assinada ? "Declaração assinada" : "Por assinar"} />
        <Bloco rot="Meta" val="Assinar a declaração de compromisso" />
        <Bloco
          rot="Assinada em"
          val={
            assinadaEm ? new Date(assinadaEm).toLocaleDateString("pt-PT") : "—"
          }
        />
      </dl>
    </article>
  );
}

function EstadoEtiqueta({ estado }: { estado: EstadoInd }) {
  const map: Record<EstadoInd, { txt: string; cls: string }> = {
    cumprida: {
      txt: "✓ Cumprida",
      cls: "bg-emerald-50 text-emerald-900 border-emerald-200",
    },
    em_curso: {
      txt: "→ Em curso",
      cls: "bg-amber-50 text-amber-900 border-amber-200",
    },
    abaixo: {
      txt: "! Abaixo da meta",
      cls: "bg-rose-50 text-rose-900 border-rose-200",
    },
    sem_dados: {
      txt: "Ainda sem dados",
      cls: "bg-ink/5 text-ink/70 border-ink/10",
    },
    sem_meta: {
      txt: "Meta não definida",
      cls: "bg-ink/5 text-ink/70 border-ink/10",
    },
  };
  const v = map[estado];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${v.cls}`}
    >
      {v.txt}
    </span>
  );
}

function Bloco({ rot, val }: { rot: string; val: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/60">
        {rot}
      </dt>
      <dd className="mt-1 text-base font-semibold text-ink">{val}</dd>
    </div>
  );
}

function fmt(v: number | null, unidade: string): string {
  if (v == null) return "Ainda sem dados";
  const n = Number.isInteger(v) ? v.toString() : v.toFixed(1);
  return unidade === "%" ? `${n}%` : unidade === "pp" ? `${n} pp` : `${n} ${unidade}`;
}
