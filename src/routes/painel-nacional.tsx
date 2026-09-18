import { createFileRoute } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

const PROVINCIAS = [
  "Cabo Delgado",
  "Niassa",
  "Nampula",
  "Zambézia",
  "Tete",
  "Manica",
  "Sofala",
  "Inhambane",
  "Gaza",
  "Província de Maputo",
  "Cidade de Maputo",
];

export const Route = createFileRoute("/painel-nacional")({
  head: () => ({
    meta: [
      { title: "Painel Nacional — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Indicadores do programa por curso, província, distrito, turma e formador, com progresso contra a meta de quatro mil formandos.",
      },
      { property: "og:title", content: "Painel Nacional — Programa de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Cada gráfico acompanhado da tabela de dados equivalente, com supressão de grupos com menos de cinco pessoas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelNacionalPage,
});

function PainelNacionalPage() {
  return (
    <PlataformaPagina
      titulo="Painel Nacional"
      introducao="Acompanhamento do programa por curso, província, distrito, turma, formador, género, faixa etária e tipo de deficiência, com progresso contra a meta contratual de quatro mil formandos."
    >
      <EstadoVazio
        titulo="Ainda sem dados para apresentar"
        descricao="Os indicadores enchem-se à medida que existirem turmas, presenças e exames, na fase 6. Em qualquer desagregação por género ou por tipo de deficiência, grupos com menos de cinco pessoas são suprimidos e mostrados como insuficiente para divulgação."
      />

      <section aria-labelledby="provincias" className="mt-10">
        <h2 id="provincias" className="text-xl font-bold text-navy">
          Cobertura prevista por província
        </h2>
        <p className="mt-2 text-base text-navy-2">
          O programa cobre as onze províncias de Moçambique. A tabela abaixo acompanha
          sempre os gráficos, para que a leitura nunca dependa apenas da cor.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Formandos inscritos, turmas e certificados por província
            </caption>
            <thead className="bg-page text-navy">
              <tr>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Província
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Turmas
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Formandos
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Certificados
                </th>
              </tr>
            </thead>
            <tbody>
              {PROVINCIAS.map((p) => (
                <tr key={p} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {p}
                  </th>
                  <td className="px-3 py-2 text-navy-2">0</td>
                  <td className="px-3 py-2 text-navy-2">0</td>
                  <td className="px-3 py-2 text-navy-2">0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PlataformaPagina>
  );
}
