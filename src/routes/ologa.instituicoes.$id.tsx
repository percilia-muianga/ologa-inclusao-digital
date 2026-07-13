import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import {
  obterInstituicaoAdmin,
  regenerarCodigoInstituicao,
  listarGestoresInstituicao,
  criarGestorInstituicao,
} from "@/lib/instituicoes.functions";
import {
  APOIOS_OPCOES,
  CONECTIVIDADE_OPCOES,
  MEIO_OPCOES,
  MODALIDADE_OPCOES,
  NATUREZA_OPCOES,
  NIVEL_LITERACIA_OPCOES,
  PERCURSO_OPCOES,
  SALA_OPCOES,
  SETOR_OPCOES,
  rotulo,
  rotulosLista,
} from "@/lib/inscricao-schema";

export const Route = createFileRoute("/ologa/instituicoes/$id")({
  head: () => ({ meta: [{ title: "Ficha da instituição — Ologa" }] }),
  component: FichaPage,
});

type Instituicao = {
  id: string;
  nome: string;
  natureza: string;
  setor: string | null;
  setor_outro: string | null;
  ponto_focal_nome: string | null;
  ponto_focal_email: string | null;
  provincia: string | null;
  distrito: string | null;
  meio: string | null;
  modalidade: string | null;
  conectividade: string | null;
  num_computadores: number | null;
  num_colaboradores_total: number;
  nivel_literacia: string | null;
  num_mulheres: number | null;
  num_homens: number | null;
  num_pcd: number | null;
  apoios_acessibilidade: string[] | null;
  modulos_interesse: string[] | null;
  percurso: string | null;
  prazo: string | null;
  sala_disponivel: string | null;
  observacoes: string | null;
  consentimento: boolean;
  codigo_inscricao: string;
  criado_em: string;
};

function FichaPage() {
  const guard = useAdminGuard();
  const { id } = Route.useParams();
  const obter = useServerFn(obterInstituicaoAdmin);
  const regenerar = useServerFn(regenerarCodigoInstituicao);
  const [inst, setInst] = useState<Instituicao | null>(null);
  const [modulos, setModulos] = useState<{ id: string; titulo: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aRegenerar, setARegenerar] = useState(false);
  const [msgRegen, setMsgRegen] = useState<string | null>(null);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    let cancelado = false;
    obter({ data: { id } }).then((res) => {
      if (cancelado) return;
      if (res.ok) {
        setInst(res.instituicao as Instituicao);
        setModulos(res.modulos);
      } else {
        setErro(
          res.mensagem === "nao_encontrada"
            ? "Instituição não encontrada."
            : res.mensagem || "Erro ao carregar.",
        );
      }
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [guard.estado, id, obter]);

  async function onRegenerar() {
    if (!inst) return;
    const confirmar = window.confirm(
      "Vai gerar um novo código de inscrição. O código antigo deixa de ser válido para novas inscrições. Continuar?",
    );
    if (!confirmar) return;
    setARegenerar(true);
    setMsgRegen(null);
    const res = await regenerar({ data: { id: inst.id } });
    setARegenerar(false);
    if (res.ok) {
      setInst({ ...inst, codigo_inscricao: res.codigo });
      setMsgRegen("Novo código gerado.");
    } else {
      setMsgRegen(res.mensagem || "Não foi possível gerar novo código.");
    }
  }

  if (guard.estado === "a_verificar" || carregando) {
    return (
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p role="status" aria-live="polite" className="text-base text-foreground">
          A carregar…
        </p>
      </main>
    );
  }
  if (guard.estado !== "ok") return null;
  if (erro || !inst) {
    return (
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p>
          <Link to="/ologa" className="text-base font-semibold text-ink underline">
            ← Voltar à lista
          </Link>
        </p>
        <p role="alert" className="mt-6 rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
          {erro ?? "Instituição não disponível."}
        </p>
      </main>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p>
          <Link to="/ologa" className="text-base font-semibold text-ink underline">
            ← Voltar à lista
          </Link>
        </p>

        <h1 className="mt-4 text-3xl font-extrabold text-ink">{inst.nome}</h1>
        <p className="mt-1 text-sm text-foreground">
          Inscrita em {new Date(inst.criado_em).toLocaleDateString("pt-PT")}
        </p>

        <div className="mt-6 rounded-md border border-ink/20 bg-accent p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
            Código de inscrição
          </p>
          <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-ink">
            {inst.codigo_inscricao}
          </p>
          <button
            type="button"
            onClick={onRegenerar}
            disabled={aRegenerar}
            className="mt-4 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70 disabled:opacity-70"
          >
            {aRegenerar ? "A gerar…" : "Gerar novo código"}
          </button>
          {msgRegen && (
            <p role="status" aria-live="polite" className="mt-2 text-sm text-ink">
              {msgRegen}
            </p>
          )}
        </div>

        <SeccaoGestor
          instituicaoId={inst.id}
          emailPontoFocal={inst.ponto_focal_email ?? ""}
          nomePontoFocal={inst.ponto_focal_nome ?? ""}
        />



        <Seccao titulo="1. Identificação">
          <Linha rot="Nome" val={inst.nome} />
          <Linha rot="Natureza" val={rotulo(NATUREZA_OPCOES, inst.natureza)} />
          <Linha rot="Setor" val={rotulo(SETOR_OPCOES, inst.setor)} />
          {inst.setor === "outro" && (
            <Linha rot="Setor (especificação)" val={inst.setor_outro ?? "—"} />
          )}
          <Linha rot="Ponto focal — nome" val={inst.ponto_focal_nome ?? "—"} />
          <Linha rot="Ponto focal — email" val={inst.ponto_focal_email ?? "—"} />
        </Seccao>

        <Seccao titulo="2. Localização">
          <Linha rot="Província" val={inst.provincia ?? "—"} />
          <Linha rot="Distrito" val={inst.distrito ?? "—"} />
          <Linha rot="Meio" val={rotulo(MEIO_OPCOES, inst.meio)} />
          <Linha
            rot="Modalidade pretendida"
            val={rotulo(MODALIDADE_OPCOES, inst.modalidade)}
          />
          <Linha
            rot="Conectividade no local"
            val={rotulo(CONECTIVIDADE_OPCOES, inst.conectividade)}
          />
          <Linha
            rot="Nº de computadores disponíveis"
            val={inst.num_computadores?.toString() ?? "—"}
          />
        </Seccao>

        <Seccao titulo="3. Colaboradores a formar">
          <Linha rot="Número total" val={inst.num_colaboradores_total.toString()} />
          <Linha
            rot="Nível de literacia digital predominante"
            val={rotulo(NIVEL_LITERACIA_OPCOES, inst.nivel_literacia)}
          />
          <Linha rot="Nº de mulheres" val={inst.num_mulheres?.toString() ?? "—"} />
          <Linha rot="Nº de homens" val={inst.num_homens?.toString() ?? "—"} />
          <Linha
            rot="Nº de pessoas com deficiência"
            val={inst.num_pcd?.toString() ?? "—"}
          />
        </Seccao>

        <Seccao titulo="4. Apoios de acessibilidade">
          <Linha
            rot="Apoios necessários"
            val={rotulosLista(APOIOS_OPCOES, inst.apoios_acessibilidade)}
          />
        </Seccao>

        <Seccao titulo="5. Módulos e percurso">
          <Linha
            rot="Módulos de interesse"
            val={
              modulos.length > 0
                ? modulos.map((m) => m.titulo).join(", ")
                : "—"
            }
          />
          <Linha rot="Percurso pretendido" val={rotulo(PERCURSO_OPCOES, inst.percurso)} />
        </Seccao>

        <Seccao titulo="6. Logística">
          <Linha rot="Prazo pretendido" val={rotulo(PRAZO_OPCOES, inst.prazo)} />
          <Linha
            rot="Sala disponível"
            val={rotulo(SALA_OPCOES, inst.sala_disponivel)}
          />
          <Linha rot="Observações" val={inst.observacoes ?? "—"} />
        </Seccao>

        <Seccao titulo="7. Consentimento">
          <Linha
            rot="Consentimento"
            val={inst.consentimento ? "Sim (confirmado)" : "Não"}
          />
        </Seccao>
      </main>
    </>
  );
}

function Seccao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-ink">{titulo}</h2>
      <dl className="mt-4 divide-y divide-ink/10 rounded-md border border-ink/10">
        {children}
      </dl>
    </section>
  );
}
function Linha({ rot, val }: { rot: string; val: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-ink/70">{rot}</dt>
      <dd className="text-base text-ink">{val}</dd>
    </div>
  );
}

type Gestor = { id: string; nome: string; email: string; criado_em: string };

function SeccaoGestor({
  instituicaoId,
  emailPontoFocal,
  nomePontoFocal,
}: {
  instituicaoId: string;
  emailPontoFocal: string;
  nomePontoFocal: string;
}) {
  const listar = useServerFn(listarGestoresInstituicao);
  const criar = useServerFn(criarGestorInstituicao);
  const [gestores, setGestores] = useState<Gestor[] | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [aMostrarForm, setAMostrarForm] = useState(false);
  const [nome, setNome] = useState(nomePontoFocal);
  const [email, setEmail] = useState(emailPontoFocal);
  const [aCriar, setACriar] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [linkGerado, setLinkGerado] = useState<{ email: string; link: string } | null>(null);

  useEffect(() => {
    let cancelado = false;
    listar({ data: { instituicao_id: instituicaoId } }).then((res) => {
      if (cancelado) return;
      if (res.ok) setGestores(res.gestores);
      else setErroLista(res.mensagem || "Erro ao carregar gestores.");
    });
    return () => {
      cancelado = true;
    };
  }, [instituicaoId, listar]);

  function abrirForm(reset: boolean) {
    setErroForm(null);
    setLinkGerado(null);
    if (reset) {
      setNome(nomePontoFocal);
      setEmail(emailPontoFocal);
    } else {
      setNome("");
      setEmail("");
    }
    setAMostrarForm(true);
  }

  async function onCriar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);
    setLinkGerado(null);
    setACriar(true);
    const res = await criar({
      data: {
        instituicao_id: instituicaoId,
        nome: nome.trim(),
        email: email.trim(),
        origin: window.location.origin,
      },
    });
    setACriar(false);
    if (res.ok) {
      setLinkGerado({ email: res.gestor.email, link: res.link });
      setAMostrarForm(false);
      const atual = gestores ?? [];
      setGestores([
        ...atual,
        {
          id: res.gestor.id,
          nome: res.gestor.nome,
          email: res.gestor.email,
          criado_em: new Date().toISOString(),
        },
      ]);
    } else {
      setErroForm(res.mensagem || "Não foi possível criar a conta.");
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-ink">Gestor da instituição</h2>

      {erroLista && (
        <p role="alert" className="mt-3 rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
          {erroLista}
        </p>
      )}

      {gestores === null && !erroLista && (
        <p className="mt-3 text-sm text-foreground">A carregar…</p>
      )}

      {gestores && gestores.length > 0 && (
        <ul className="mt-4 divide-y divide-ink/10 rounded-md border border-ink/10">
          {gestores.map((g) => (
            <li key={g.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_1fr_auto] sm:gap-4">
              <span className="text-base font-semibold text-ink">{g.nome}</span>
              <span className="text-base text-ink">{g.email}</span>
              <span className="text-sm text-ink/70">
                Criado em {new Date(g.criado_em).toLocaleDateString("pt-PT")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {linkGerado && (
        <div className="mt-4 rounded-md border border-ink/20 bg-accent p-4">
          <p className="text-sm font-semibold text-ink">
            Link de definição de palavra-passe para {linkGerado.email}:
          </p>
          <p className="mt-2 break-all rounded-md border border-ink/20 bg-white p-3 font-mono text-sm text-ink">
            {linkGerado.link}
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(linkGerado.link)}
            className="mt-3 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70"
          >
            Copiar link
          </button>
        </div>
      )}

      {!aMostrarForm && gestores && (
        <div className="mt-4">
          {gestores.length === 0 ? (
            <button
              type="button"
              onClick={() => abrirForm(true)}
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-white hover:bg-ink/90"
            >
              Criar conta de gestor
            </button>
          ) : (
            <button
              type="button"
              onClick={() => abrirForm(false)}
              className="inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70"
            >
              Criar segundo gestor
            </button>
          )}
        </div>
      )}

      {aMostrarForm && (
        <form onSubmit={onCriar} className="mt-4 space-y-4 rounded-md border border-ink/20 bg-white p-4">
          <div>
            <label htmlFor="gestor-nome" className="block text-sm font-semibold text-ink">
              Nome do gestor
            </label>
            <input
              id="gestor-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/30 px-3 py-2 text-base text-ink"
            />
          </div>
          <div>
            <label htmlFor="gestor-email" className="block text-sm font-semibold text-ink">
              Email do gestor
            </label>
            <input
              id="gestor-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/30 px-3 py-2 text-base text-ink"
            />
          </div>
          {erroForm && (
            <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-sm text-ink">
              {erroForm}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={aCriar}
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-white hover:bg-ink/90 disabled:opacity-70"
            >
              {aCriar ? "A criar…" : "Confirmar e criar conta"}
            </button>
            <button
              type="button"
              onClick={() => setAMostrarForm(false)}
              className="inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
