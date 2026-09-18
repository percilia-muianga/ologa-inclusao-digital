import { createFileRoute, Link } from "@tanstack/react-router";
import { PlataformaPagina } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/conformidade")({
  head: () => ({
    meta: [
      { title: "Conformidade — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Acessibilidade, desenho universal, Lei n.º 10/2024, protecção de dados sensíveis e registo de actividade imutável.",
      },
      { property: "og:title", content: "Conformidade — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "O que a plataforma garante em acessibilidade, auditabilidade e protecção de dados, e como isso pode ser verificado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConformidadePage,
});

const BLOCOS: { titulo: string; itens: string[] }[] = [
  {
    titulo: "Acessibilidade e desenho universal",
    itens: [
      "Barra de acessibilidade em todos os ecrãs: aumentar e diminuir o texto, alto contraste e reposição.",
      "Leitura em voz alta em português, com velocidade ajustável entre 0,75× e 1,35× e paragem imediata.",
      "Ligação para saltar para o conteúdo principal, navegação completa por teclado e áreas de toque de pelo menos 44 pixéis.",
      "Conteúdo compatível com leitor de ecrã; a informação nunca depende apenas da cor.",
    ],
  },
  {
    titulo: "Lei n.º 10/2024 — direitos da pessoa com deficiência",
    itens: [
      "Módulo transversal obrigatório em todos os cursos: Governo Digital Inclusivo e Acessibilidade, com duas horas, sobre os deveres das instituições públicas.",
      "Recolha do tipo de deficiência apenas de forma opcional e autodeclarada, reversível pelo próprio a qualquer momento.",
      "Apoios de acessibilidade registados por instituição e por formando, para planeamento das sessões.",
    ],
  },
  {
    titulo: "Protecção de dados e auditoria",
    itens: [
      "Registo de actividade imutável: criação, alteração e eliminação ficam gravadas pela própria base de dados, com utilizador, acção, entidade, valor anterior, valor novo, data, hora e endereço.",
      "Excepção explícita para o tipo de deficiência: regista-se que houve alteração, nunca o conteúdo.",
      "Quem consulta dados sensíveis também é registado: quem consultou, de quem, o quê e quando.",
      "Regra dos cinco em toda a divulgação: grupos com menos de cinco pessoas são suprimidos.",
    ],
  },
  {
    titulo: "Acesso público",
    itens: [
      "Os módulos de literacia digital estão abertos a qualquer pessoa, sem criar conta e sem entrar.",
      "O progresso de quem não tem conta fica guardado no próprio dispositivo.",
      "Qualquer certificado pode ser verificado publicamente pelo seu código único.",
    ],
  },
];

function ConformidadePage() {
  return (
    <PlataformaPagina
      titulo="Conformidade"
      introducao="O que esta plataforma garante em acessibilidade, protecção de dados e auditabilidade — e como cada garantia pode ser verificada por quem avalia."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {BLOCOS.map((b) => (
          <section
            key={b.titulo}
            aria-labelledby={b.titulo}
            className="rounded-lg border border-line bg-white p-5"
          >
            <h2 id={b.titulo} className="text-lg font-bold text-navy">
              {b.titulo}
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-navy-2">
              {b.itens.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="provas" className="mt-10 rounded-lg border border-line bg-page p-5">
        <h2 id="provas" className="text-lg font-bold text-navy">
          Provas verificáveis
        </h2>
        <p className="mt-2 text-base text-navy-2">
          A matriz de permissões da plataforma é lida directamente das regras em vigor na
          base de dados, nunca escrita à mão. Está disponível na área interna, a
          administradores e auditores, e é exportável com data.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/verificar"
            className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
          >
            Verificar um certificado
          </Link>
          <Link
            to="/entrar"
            className="inline-flex min-h-11 items-center rounded-md border border-navy px-4 text-base font-semibold text-navy"
          >
            Entrar na área interna
          </Link>
        </div>
      </section>
    </PlataformaPagina>
  );
}
