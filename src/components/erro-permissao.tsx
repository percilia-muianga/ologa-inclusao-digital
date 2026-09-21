import { Link } from "@tanstack/react-router";
import { PlataformaPagina } from "@/components/plataforma-pagina";

/**
 * Mensagem única para quando o servidor recusa o acesso a uma área de gestão.
 * A decisão é sempre do servidor: esta página apenas explica a recusa.
 */
export function ErroPermissao({ erro }: { erro?: unknown }) {
  const texto = erro instanceof Error ? erro.message : String(erro ?? "");
  const semSessao = /unauthorized|401/i.test(texto);
  return (
    <PlataformaPagina
      titulo={semSessao ? "É preciso entrar" : "Sem permissão para esta área"}
      descricao={
        semSessao
          ? "Esta área é reservada à equipa autorizada. Entre com a sua conta para continuar."
          : "A sua conta não tem permissão para ver ou alterar esta área. Fale com a administração do programa."
      }
    >
      <p className="text-base text-navy">
        <Link to="/auth" className="font-semibold underline">
          Entrar na plataforma
        </Link>
      </p>
    </PlataformaPagina>
  );
}
