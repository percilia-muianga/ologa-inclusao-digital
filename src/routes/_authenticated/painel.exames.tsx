import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarConfiguracaoExame, panoramaBanco, permissaoGestaoBanco } from "@/lib/avaliacao.functions";

export const Route = createFileRoute("/_authenticated/painel/exames")({
  head: () => ({
    meta: [
      { title: "Configuração dos exames — Plataforma Nacional" },
      { name: "description", content: "Número de questões, tempo, dificuldade e regras de aprovação do exame final de cada curso." },
      { property: "og:title", content: "Configuração dos exames" },
      { property: "og:description", content: "Regras do exame final por curso, sem activar questões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfiguracaoExames,
});

type Cfg = {
  numeroQuestoes: number; minutos: number; pctFacil: number; pctMedia: number; pctDificil: number;
  notaMinimaPct: number; assiduidadeMinimaPct: number; prazoDias: number; tentativasMax: number;
};

const CAMPOS: { k: keyof Cfg; rotulo: string }[] = [
  { k: "numeroQuestoes", rotulo: "Questões por prova" },
  { k: "minutos", rotulo: "Duração (minutos)" },
  { k: "pctFacil", rotulo: "Fáceis (%)" },
  { k: "pctMedia", rotulo: "Médias (%)" },
  { k: "pctDificil", rotulo: "Difíceis (%)" },
  { k: "notaMinimaPct", rotulo: "Nota mínima (%)" },
  { k: "assiduidadeMinimaPct", rotulo: "Assiduidade mínima (%)" },
  { k: "prazoDias", rotulo: "Prazo para fazer o exame (dias)" },
  { k: "tentativasMax", rotulo: "Tentativas máximas" },
];

type Curso = Awaited<ReturnType<typeof panoramaBanco>>["cursos"][number];

function CartaoCurso({ curso, podeEscrever }: { curso: Curso; podeEscrever: boolean }) {
  const [cfg, setCfg] = useState<Cfg>(curso.configuracao);
  const guardar = useServerFn(guardarConfiguracaoExame);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => guardar({ data: { cursoId: curso.id, ...cfg } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panorama-exames"] }),
  });
  const soma = cfg.pctFacil + cfg.pctMedia + cfg.pctDificil;
  const pronto = curso.activas >= curso.necessarias && curso.activas > 0;

  return (
    <section className="rounded-md border border-line p-5" aria-labelledby={`c-${curso.id}`}>
      <h2 id={`c-${curso.id}`} className="text-xl font-bold text-navy">{curso.titulo}</h2>
      <p className={`mt-2 inline-block rounded-md border px-3 py-1 text-sm font-bold ${curso.configuracaoGuardada ? "border-navy text-navy" : "border-brand text-brand"}`}>
        {curso.configuracaoGuardada ? "Configuração guardada" : "Valores padrão — configuração ainda não guardada"}
      </p>
      <p className="mt-1 text-sm text-navy-2">
        Banco do exame: {curso.total} questões ({curso.activas} activas, {curso.rascunhos} inactivas). Mínimo exigido (triplo da prova): {cfg.numeroQuestoes * 3} activas.
      </p>
      <p className="mt-1 text-sm font-semibold text-navy">
        Estado do exame: {pronto ? "com questões activas suficientes" : "inactivo — sem questões activas suficientes"}.
      </p>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-3"
        onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
      >
        {CAMPOS.map(({ k, rotulo }) => (
          <div key={k}>
            <Label htmlFor={`${curso.id}-${k}`}>{rotulo}</Label>
            <Input
              id={`${curso.id}-${k}`}
              type="number"
              inputMode="numeric"
              value={cfg[k]}
              disabled={!podeEscrever}
              onChange={(e) => setCfg({ ...cfg, [k]: Number(e.target.value) })}
            />
          </div>
        ))}
        <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" className="min-h-11" disabled={!podeEscrever || soma !== 100 || m.isPending}>
            {m.isPending ? "A guardar…" : "Guardar configuração"}
          </Button>
          {soma !== 100 ? <p role="alert" className="text-sm font-semibold text-brand">As percentagens de dificuldade somam {soma}%; têm de somar 100%.</p> : null}
          {m.isSuccess ? <p role="status" className="text-sm text-navy">Configuração guardada. Nenhuma questão foi activada.</p> : null}
          {m.isError ? <p role="alert" className="text-sm font-semibold text-brand">Não foi possível guardar. Verifique os valores e as suas permissões.</p> : null}
        </div>
      </form>
    </section>
  );
}

function ConfiguracaoExames() {
  const pan = useServerFn(panoramaBanco);
  const perm = useServerFn(permissaoGestaoBanco);
  const q = useQuery({ queryKey: ["panorama-exames"], queryFn: () => pan() });
  const p = useQuery({ queryKey: ["permissao-banco"], queryFn: () => perm() });
  const podeEscrever = !!p.data?.podeEscrever;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Configuração dos exames</h1>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Regras do exame final de cada curso. Guardar aqui não activa questões nem abre exames: um exame
        só funciona quando o banco tiver questões activas suficientes.
      </p>
      {p.data && !podeEscrever ? (
        <p role="status" className="mt-4 text-base text-navy">A sua conta pode consultar, mas não alterar, estas regras.</p>
      ) : null}
      {q.isLoading ? <p className="mt-6 text-base text-navy-2">A carregar…</p> : null}
      {q.isError ? <p role="alert" className="mt-6 text-base font-semibold text-brand">Não foi possível carregar os cursos.</p> : null}
      <div className="mt-6 grid gap-6">
        {q.data?.cursos.map((c) => <CartaoCurso key={c.id} curso={c} podeEscrever={podeEscrever} />)}
      </div>
    </div>
  );
}
