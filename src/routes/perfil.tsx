import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "O meu perfil — Ologa" }] }),
  component: PerfilPage,
});

type Genero = "feminino" | "masculino" | "prefere_nao_indicar";
type Nivel = "nenhum" | "basico" | "intermedio" | "prefere_nao_indicar";

type Apoio = "lsm" | "leitura_facil" | "baixa_visao" | "audiodescricao" | "mobilidade" | "nenhum";

const APOIOS: Array<{ v: Apoio; l: string }> = [
  { v: "lsm", l: "Língua de Sinais Moçambicana" },
  { v: "leitura_facil", l: "Leitura fácil / linguagem simples" },
  { v: "baixa_visao", l: "Baixa visão / letra ampliada" },
  { v: "audiodescricao", l: "Áudio / audiodescrição" },
  { v: "mobilidade", l: "Mobilidade / sala acessível" },
  { v: "nenhum", l: "Nenhum apoio específico" },
];

function PerfilPage() {
  const navigate = useNavigate();
  const nomeId = useId();

  const [carregado, setCarregado] = useState(false);
  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState<Genero | "">("");
  const [nivel, setNivel] = useState<Nivel | "">("");
  const [defic, setDefic] = useState<"sim" | "nao" | "prefere_nao_indicar" | "">("");
  const [apoios, setApoios] = useState<Set<Apoio>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/entrar" });
        return;
      }
      const { data: perfil } = await supabase
        .from("perfis")
        .select("nome, genero, nivel_partida, tem_deficiencia, apoios_acessibilidade")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (perfil) {
        setNome(perfil.nome ?? "");
        setGenero((perfil.genero as Genero | null) ?? "");
        setNivel((perfil.nivel_partida as Nivel | null) ?? "");
        setDefic(
          perfil.tem_deficiencia === true
            ? "sim"
            : perfil.tem_deficiencia === false
            ? "nao"
            : "",
        );
        setApoios(new Set((perfil.apoios_acessibilidade ?? []) as Apoio[]));
      }
      setCarregado(true);
    })();
  }, [navigate]);

  function toggleApoio(a: Apoio) {
    setApoios((prev) => {
      const n = new Set(prev);
      if (n.has(a)) n.delete(a);
      else n.add(a);
      return n;
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const tem_deficiencia =
      defic === "sim" ? true : defic === "nao" ? false : null;
    const { error } = await supabase
      .from("perfis")
      .update({
        nome: nome.trim(),
        genero: genero === "" ? null : genero,
        nivel_partida: nivel === "" ? null : nivel,
        tem_deficiencia,
        apoios_acessibilidade: apoios.size > 0 ? Array.from(apoios) : null,
      })
      .eq("id", userData.user.id);
    if (error) setErro("Não foi possível guardar. Tente novamente.");
    else setMsg("Perfil atualizado.");
  }

  async function apagarOpcionais() {
    setErro(null);
    setMsg(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("perfis")
      .update({
        genero: null,
        nivel_partida: null,
        tem_deficiencia: null,
        apoios_acessibilidade: null,
      })
      .eq("id", userData.user.id);
    if (error) {
      setErro("Não foi possível apagar. Tente novamente.");
      return;
    }
    setGenero("");
    setNivel("");
    setDefic("");
    setApoios(new Set());
    setMsg("Respostas opcionais apagadas.");
  }

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/entrar" });
  }

  if (!carregado) {
    return (
      <main id="conteudo" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <p role="status" aria-live="polite" className="text-base text-foreground">A carregar…</p>
      </main>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">O meu perfil</h1>

        <form onSubmit={guardar} noValidate className="mt-8 space-y-6">
          <div>
            <label htmlFor={nomeId} className="block text-base font-semibold text-ink">Nome completo</label>
            <input
              id={nomeId}
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
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
                    <input type="radio" name="genero" checked={genero === o.v} onChange={() => setGenero(o.v as Genero)} />
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
                    <input type="radio" name="nivel" checked={nivel === o.v} onChange={() => setNivel(o.v as Nivel)} />
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
                      checked={defic === o.v}
                      onChange={() => setDefic(o.v as "sim" | "nao" | "prefere_nao_indicar")}
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
                  <label key={a.v} className="inline-flex items-center gap-2 text-base text-ink">
                    <input type="checkbox" checked={apoios.has(a.v)} onChange={() => toggleApoio(a.v)} />
                    {a.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={apagarOpcionais}
              className="mt-4 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-3 text-base font-semibold text-ink hover:bg-accent"
            >
              Apagar respostas opcionais
            </button>
          </fieldset>

          {msg && (
            <p role="status" aria-live="polite" className="rounded-md border border-ink/20 bg-accent p-3 text-base text-ink">
              {msg}
            </p>
          )}
          {erro && (
            <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
              {erro}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 py-3 text-base font-semibold text-ink-foreground"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={sair}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink/30 bg-white px-6 py-3 text-base font-semibold text-ink"
            >
              Terminar sessão
            </button>
            <Link
              to="/formacao"
              className="inline-flex min-h-12 items-center justify-center rounded-md px-6 py-3 text-base font-semibold text-ink underline"
            >
              Voltar
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
