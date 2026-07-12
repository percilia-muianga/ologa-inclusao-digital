import { createFileRoute, Link, useServerFn } from "@tanstack/react-router";
import { useId, useState } from "react";
import { registarFormando } from "@/lib/auth.functions";

export const Route = createFileRoute("/registo")({
  head: () => ({
    meta: [{ title: "Criar conta — Ologa" }],
  }),
  component: RegistoPage,
});

type Genero = "feminino" | "masculino" | "prefere_nao_indicar";
type Nivel = "nenhum" | "basico" | "intermedio" | "prefere_nao_indicar";
type Deficiencia = "sim" | "nao" | "prefere_nao_indicar";

const APOIOS: Array<string> = [
  "Língua de Sinais Moçambicana",
  "Leitura fácil / linguagem simples",
  "Baixa visão / letra ampliada",
  "Áudio / audiodescrição",
  "Mobilidade / sala acessível",
  "Nenhum apoio específico",
];

function RegistoPage() {
  const registar = useServerFn(registarFormando);
  const codigoId = useId();
  const emailId = useId();
  const passId = useId();
  const nomeId = useId();
  const errId = useId();

  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState<Genero | "">("");
  const [nivel, setNivel] = useState<Nivel | "">("");
  const [defic, setDefic] = useState<Deficiencia | "">("");
  const [apoios, setApoios] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  function toggleApoio(a: string) {
    setApoios((prev) => {
      const n = new Set(prev);
      if (n.has(a)) n.delete(a);
      else n.add(a);
      return n;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const tem_deficiencia =
      defic === "sim" ? true : defic === "nao" ? false : null;
    const res = await registar({
      data: {
        codigo,
        email,
        password,
        nome,
        genero: genero === "" ? null : genero,
        nivel_partida: nivel === "" ? null : nivel,
        tem_deficiencia,
        apoios_acessibilidade: apoios.size > 0 ? Array.from(apoios) : null,
        origin: window.location.origin,
      },
    });
    setLoading(false);
    if (res.ok) {
      setSucesso(true);
      return;
    }
    if (res.erro === "codigo_invalido") {
      setErro("Este código não é válido. Confirme-o com o ponto focal da sua instituição.");
    } else if (res.erro === "auth") {
      setErro(res.mensagem || "Não foi possível criar a conta.");
    } else {
      setErro("Não foi possível criar a conta agora. Tente novamente.");
    }
  }

  if (sucesso) {
    return (
      <>
        <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
        <main id="conteudo" className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <h1 className="text-3xl font-extrabold text-ink">Conta criada</h1>
          <p className="mt-4 text-base text-foreground">
            Enviámos um email de confirmação para <strong>{email}</strong>. Clique no link
            desse email para poder entrar.
          </p>
          <div className="mt-6">
            <Link to="/entrar" className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground">
              Ir para Entrar
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Criar conta</h1>
        <p className="mt-2 text-base text-foreground">
          Introduza o código da sua instituição para se registar como formando.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6" aria-describedby={erro ? errId : undefined}>
          <div>
            <label htmlFor={codigoId} className="block text-base font-semibold text-ink">Código da instituição</label>
            <input
              id={codigoId}
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor={nomeId} className="block text-base font-semibold text-ink">Nome completo</label>
            <input
              id={nomeId}
              type="text"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor={emailId} className="block text-base font-semibold text-ink">Email</label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor={passId} className="block text-base font-semibold text-ink">Palavra-passe</label>
            <input
              id={passId}
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              aria-describedby={`${passId}-hint`}
            />
            <p id={`${passId}-hint`} className="mt-1 text-sm text-muted-foreground">Mínimo 8 caracteres.</p>
          </div>

          <fieldset className="rounded-md border border-ink/20 bg-white p-4">
            <legend className="px-2 text-lg font-bold text-ink">Ajude-nos a medir a inclusão (opcional)</legend>
            <p className="mt-1 text-base text-foreground">
              Estas respostas são opcionais e servem apenas para medirmos o alcance da
              formação. Não influenciam o seu acesso: a plataforma é igual para todas as pessoas.
              Pode deixar em branco ou alterar mais tarde.
            </p>

            <fieldset className="mt-4">
              <legend className="text-base font-semibold text-ink">Género</legend>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { v: "feminino", l: "Feminino" },
                  { v: "masculino", l: "Masculino" },
                  { v: "prefere_nao_indicar", l: "Prefiro não indicar" },
                ].map((o) => (
                  <label key={o.v} className="inline-flex items-center gap-2 text-base text-ink">
                    <input
                      type="radio"
                      name="genero"
                      value={o.v}
                      checked={genero === o.v}
                      onChange={() => setGenero(o.v as Genero)}
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-base font-semibold text-ink">Nível de literacia digital de partida</legend>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { v: "nenhum", l: "Nenhum" },
                  { v: "basico", l: "Básico" },
                  { v: "intermedio", l: "Intermédio" },
                  { v: "prefere_nao_indicar", l: "Prefiro não indicar" },
                ].map((o) => (
                  <label key={o.v} className="inline-flex items-center gap-2 text-base text-ink">
                    <input
                      type="radio"
                      name="nivel"
                      value={o.v}
                      checked={nivel === o.v}
                      onChange={() => setNivel(o.v as Nivel)}
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-base font-semibold text-ink">Vive com alguma deficiência?</legend>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { v: "sim", l: "Sim" },
                  { v: "nao", l: "Não" },
                  { v: "prefere_nao_indicar", l: "Prefiro não indicar" },
                ].map((o) => (
                  <label key={o.v} className="inline-flex items-center gap-2 text-base text-ink">
                    <input
                      type="radio"
                      name="defic"
                      value={o.v}
                      checked={defic === o.v}
                      onChange={() => setDefic(o.v as Deficiencia)}
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-base font-semibold text-ink">Apoios de acessibilidade de que precisa (opcional)</legend>
              <div className="mt-2 flex flex-col gap-2">
                {APOIOS.map((a) => (
                  <label key={a} className="inline-flex items-center gap-2 text-base text-ink">
                    <input
                      type="checkbox"
                      checked={apoios.has(a)}
                      onChange={() => toggleApoio(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>

          {erro && (
            <p id={errId} role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-ink px-6 py-3 text-base font-semibold text-ink-foreground disabled:opacity-70"
          >
            {loading ? "A criar conta…" : "Criar conta"}
          </button>
        </form>

        <div className="mt-6">
          <Link to="/entrar" className="font-semibold text-ink underline">Já tenho conta — entrar</Link>
        </div>
      </main>
    </>
  );
}
