import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plataforma Nacional de Capacitação Digital — Moçambique" },
      {
        name: "description",
        content:
          "Gestão nacional da formação em competências digitais: cursos, turmas, presenças, avaliação, certificados e painel de indicadores, acessível a todas as pessoas.",
      },
      {
        property: "og:title",
        content: "Plataforma Nacional de Capacitação Digital — Moçambique",
      },
      {
        property: "og:description",
        content:
          "Seis cursos, onze províncias e setenta e sete distritos. Módulos de literacia digital abertos ao público, sem necessidade de conta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlataformaHome,
});

const AREAS: { to: string; titulo: string; descricao: string }[] = [
  {
    to: "/cursos",
    titulo: "Cursos",
    descricao:
      "Seis cursos do programa e um módulo transversal obrigatório de Governo Digital Inclusivo e Acessibilidade.",
  },
  {
    to: "/turmas",
    titulo: "Turmas",
    descricao:
      "Turmas por província e distrito de formação, com código de inscrição, formadores e cronograma de sessões.",
  },
  {
    to: "/presencas",
    titulo: "Presenças",
    descricao:
      "Marcação por sessão, feita para telefone, a funcionar sem internet, com assiduidade sempre visível.",
  },
  {
    to: "/avaliacao",
    titulo: "Avaliação",
    descricao:
      "Banco de questões por curso e módulo e exame final único para cada formando.",
  },
  {
    to: "/certificados",
    titulo: "Certificados",
    descricao:
      "Certificado individual por formando e por curso, com código único de verificação pública.",
  },
  {
    to: "/painel-nacional",
    titulo: "Painel Nacional",
    descricao:
      "Indicadores por curso, província, distrito e turma, com progresso contra as metas do programa.",
  },
  {
    to: "/conformidade",
    titulo: "Conformidade",
    descricao:
      "Acessibilidade, desenho universal, Lei n.º 10/2024, protecção de dados e registo de actividade imutável.",
  },
];

const NUMEROS: { valor: string; rotulo: string }[] = [
  { valor: "6", rotulo: "cursos do programa" },
  { valor: "11", rotulo: "províncias abrangidas" },
  { valor: "2 horas", rotulo: "módulo transversal" },
  { valor: "77", rotulo: "distritos abrangidos" },
];

function PlataformaHome() {
  const conteudoRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo">
        <div ref={conteudoRef}>
          <section className="border-b border-line bg-page">
            <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
                Programa nacional de capacitação digital
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight text-navy sm:text-5xl">
                Plataforma de gestão da formação em competências digitais
              </h1>
              <p className="mt-4 max-w-3xl text-base text-navy-2 sm:text-lg">
                Cursos, turmas, presenças, avaliação e certificação, com acompanhamento
                nacional por província e distrito. Desenhada segundo os princípios do desenho
                universal: as mesmas turmas, os mesmos materiais e os mesmos certificados para
                todas as pessoas.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/cursos"
                  className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
                >
                  Ver os cursos
                </Link>
                <Link
                  to="/painel-nacional"
                  className="inline-flex min-h-11 items-center rounded-md border border-navy px-5 text-base font-semibold text-navy"
                >
                  Painel Nacional
                </Link>
                <ListenButton
                  label="🔊 Ouvir esta página"
                  getFalas={() => extrairFalasDeElemento(conteudoRef.current)}
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="numeros" className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6">
            <h2 id="numeros" className="sr-only">
              Dimensão do programa
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {NUMEROS.map((n) => (
                <div key={n.rotulo} className="rounded-lg border border-line bg-white p-5">
                  <dt className="text-sm font-semibold text-navy-2">{n.rotulo}</dt>
                  <dd className="mt-1 text-3xl font-extrabold text-navy">{n.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="areas"
            className="mx-auto max-w-[1360px] px-4 pb-4 sm:px-6"
          >
            <h2 id="areas" className="text-2xl font-extrabold text-navy">
              Áreas da plataforma
            </h2>
            <p className="mt-2 max-w-3xl text-base text-navy-2">
              Os cursos, as lições e o teste de literacia digital estão abertos a
              qualquer pessoa, sem conta. As áreas de gestão — turmas, presenças,
              workshops, relatórios, indicadores e documentos — só abrem com conta
              autorizada da equipa. Onde ainda não existem dados, o ecrã explica o
              que está a suceder e o que se segue.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {AREAS.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="block rounded-lg border border-line bg-white p-5 transition-colors hover:border-navy focus-visible:border-navy"
                >
                  <h3 className="text-lg font-bold text-navy">{a.titulo}</h3>
                  <p className="mt-2 text-base text-navy-2">{a.descricao}</p>
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="publico"
            className="mx-auto mt-10 max-w-[1360px] px-4 sm:px-6"
          >
            <div className="rounded-lg border border-line bg-page p-6">
              <h2 id="publico" className="text-2xl font-extrabold text-navy">
                Acesso público, sem criar conta
              </h2>
              <p className="mt-2 max-w-3xl text-base text-navy-2">
                Os onze módulos de literacia digital estão abertos a qualquer pessoa. Não é
                preciso conta nem sessão iniciada: o progresso fica guardado no próprio
                dispositivo. Qualquer certificado emitido pode ser verificado publicamente
                pelo seu código.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/formacao"
                  className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
                >
                  Abrir os módulos de literacia digital
                </Link>
                <Link
                  to="/verificar"
                  className="inline-flex min-h-11 items-center rounded-md border border-navy px-5 text-base font-semibold text-navy"
                >
                  Verificar um certificado
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <PlataformaFooter />
    </>
  );
}
