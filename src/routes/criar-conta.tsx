import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";
import { PROVINCIAS, GENEROS } from "@/lib/papeis";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar conta — Ologa" },
      {
        name: "description",
        content:
          "Crie a sua conta na plataforma de literacia digital da Ologa para acompanhar o seu percurso, presenças e certificados.",
      },
      { property: "og:title", content: "Criar conta — Ologa" },
      {
        property: "og:description",
        content: "Conta pessoal na plataforma de literacia digital da Ologa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CriarContaPage,
});

function CriarContaPage() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement | null>(null);
  const ids = {
    nome: useId(),
    email: useId(),
    pass: useId(),
    telefone: useId(),
    entidade: useId(),
    provincia: useId(),
    distrito: useId(),
    cargo: useId(),
    genero: useId(),
    deficiencia: useId(),
    erro: useId(),
  };

  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    telefone: "",
    entidade_empregadora: "",
    provincia: "",
    distrito: "",
    cargo: "",
    genero: "",
    tipo_deficiencia: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  const definir = (campo: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!form.provincia || !form.distrito.trim()) {
      setErro("Indique a província e o distrito. São campos obrigatórios.");
      return;
    }
    setACarregar(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome: form.nome,
          telefone: form.telefone,
          entidade_empregadora: form.entidade_empregadora,
          provincia: form.provincia,
          distrito: form.distrito,
          cargo: form.cargo,
          genero: form.genero,
          tipo_deficiencia: form.tipo_deficiencia,
        },
      },
    });
    setACarregar(false);
    if (error) {
      setErro(
        error.message.toLowerCase().includes("already")
          ? "Já existe uma conta com este email."
          : "Não foi possível criar a conta. Verifique os dados e tente de novo.",
      );
      return;
    }
    if (data.session) {
      navigate({ to: "/painel" });
      return;
    }
    setConfirmar(true);
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo" ref={ref} className="wrap max-w-2xl py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-navy">Criar conta</h1>
          <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
        </div>
        <p className="mt-2 text-base text-navy-2">
          A conta serve para acompanhar o seu percurso de formação. Os módulos de literacia
          digital continuam abertos a todas as pessoas sem conta, e o progresso guardado no
          seu aparelho continua a funcionar.
        </p>

        {confirmar ? (
          <div role="status" className="mt-8 rounded-lg border border-line bg-page p-5">
            <h2 className="text-xl font-extrabold text-navy">Confirme o seu email</h2>
            <p className="mt-2 text-base text-navy-2">
              Enviámos uma mensagem para {form.email}. Abra a ligação que lá está para
              confirmar a conta e depois entre na plataforma.
            </p>
            <Link to="/entrar" className="mt-4 inline-block text-base font-semibold underline">
              Ir para a página de entrada
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            <Campo id={ids.nome} etiqueta="Nome completo" obrigatorio>
              <input id={ids.nome} required value={form.nome} onChange={definir("nome")} className={ENTRADA} autoComplete="name" />
            </Campo>

            <Campo id={ids.email} etiqueta="Email" obrigatorio>
              <input id={ids.email} type="email" required value={form.email} onChange={definir("email")} className={ENTRADA} autoComplete="email" />
            </Campo>

            <Campo id={ids.pass} etiqueta="Palavra-passe" ajuda="Pelo menos 8 caracteres." obrigatorio>
              <input id={ids.pass} type="password" required minLength={8} value={form.password} onChange={definir("password")} className={ENTRADA} autoComplete="new-password" />
            </Campo>

            <Campo id={ids.telefone} etiqueta="Telefone">
              <input id={ids.telefone} type="tel" value={form.telefone} onChange={definir("telefone")} className={ENTRADA} autoComplete="tel" />
            </Campo>

            <Campo id={ids.entidade} etiqueta="Entidade empregadora">
              <input id={ids.entidade} value={form.entidade_empregadora} onChange={definir("entidade_empregadora")} className={ENTRADA} />
            </Campo>

            <Campo id={ids.provincia} etiqueta="Província" obrigatorio>
              <select id={ids.provincia} required value={form.provincia} onChange={definir("provincia")} className={ENTRADA}>
                <option value="">Escolha a província</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Campo>

            <Campo id={ids.distrito} etiqueta="Distrito" obrigatorio>
              <input id={ids.distrito} required value={form.distrito} onChange={definir("distrito")} className={ENTRADA} />
            </Campo>

            <Campo id={ids.cargo} etiqueta="Cargo">
              <input id={ids.cargo} value={form.cargo} onChange={definir("cargo")} className={ENTRADA} />
            </Campo>

            <Campo id={ids.genero} etiqueta="Género">
              <select id={ids.genero} value={form.genero} onChange={definir("genero")} className={ENTRADA}>
                <option value="">Prefiro não indicar</option>
                {GENEROS.map((g) => (
                  <option key={g.valor} value={g.valor}>{g.nome}</option>
                ))}
              </select>
            </Campo>

            <Campo
              id={ids.deficiencia}
              etiqueta="Tipo de deficiência (opcional e autodeclarado)"
              ajuda="Serve apenas para adaptar a formação. Pode apagar ou alterar este dado a qualquer momento, e o conteúdo nunca é guardado no registo de actividade."
            >
              <input id={ids.deficiencia} value={form.tipo_deficiencia} onChange={definir("tipo_deficiencia")} className={ENTRADA} />
            </Campo>

            {erro ? (
              <p id={ids.erro} role="alert" className="rounded-md border border-line bg-page p-3 text-base text-navy">
                {erro}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={aCarregar}
              className="min-h-12 w-full rounded-md bg-navy px-6 py-3 text-base font-semibold text-white disabled:opacity-70"
            >
              {aCarregar ? "A criar conta…" : "Criar conta"}
            </button>

            <p className="text-base text-navy-2">
              Já tem conta?{" "}
              <Link to="/entrar" className="font-semibold underline">Entrar</Link>
            </p>
          </form>
        )}
      </main>
      <PlataformaFooter />
    </>
  );
}

const ENTRADA =
  "mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-navy";

function Campo({
  id,
  etiqueta,
  ajuda,
  obrigatorio,
  children,
}: {
  id: string;
  etiqueta: string;
  ajuda?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold text-navy">
        {etiqueta}
        {obrigatorio ? <span aria-hidden="true"> *</span> : null}
        {obrigatorio ? <span className="sr-only"> (obrigatório)</span> : null}
      </label>
      {children}
      {ajuda ? <p className="mt-1 text-sm text-navy-2">{ajuda}</p> : null}
    </div>
  );
}
