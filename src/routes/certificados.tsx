import { createFileRoute, Link } from "@tanstack/react-router";
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
          "Certificação automática com assiduidade igual ou superior a oitenta por cento e nota final igual ou superior a sessenta por cento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CertificadosPage,
});

function CertificadosPage() {
  return (
    <PlataformaPagina
      titulo="Certificados"
      introducao="O certificado é individual, por formando e por curso. Leva nome, curso, carga horária, província, turma, datas, nota final, assiduidade e um código único de verificação."
    >
      <EstadoVazio
        titulo="Ainda não foram emitidos certificados"
        descricao="A emissão automática entra na fase 5, com duas regras: assiduidade igual ou superior a oitenta por cento e nota final igual ou superior a sessenta por cento. A verificação pública de um código já funciona hoje."
        accao={
          <Link
            to="/verificar"
            className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
          >
            Verificar um certificado
          </Link>
        }
      />
    </PlataformaPagina>
  );
}
