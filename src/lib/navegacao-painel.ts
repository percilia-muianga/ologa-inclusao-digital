/**
 * Navegação da área reservada.
 *
 * Isto é apenas apresentação: decide que ligações se mostram conforme o papel
 * de vista activo. Não concede acesso nenhum — cada função de servidor continua
 * a validar quem pede, e uma ligação visível a mais nunca abre dados a mais.
 */
import type { PapelSistema } from "./papeis";

export type LigacaoPainel = { to: string; rotulo: string };

/** Ligações comuns a qualquer conta com área reservada. */
const COMUNS: LigacaoPainel[] = [
  { to: "/painel", rotulo: "Início" },
  { to: "/formacao", rotulo: "Cursos" },
  { to: "/", rotulo: "Site" },
];

const ADMIN: LigacaoPainel[] = [
  { to: "/painel", rotulo: "Início" },
  { to: "/gestao/instituicoes", rotulo: "Instituições" },
  { to: "/painel/utilizadores", rotulo: "Utilizadores" },
  { to: "/painel/equipa", rotulo: "Equipa e testes" },
  { to: "/painel/permissoes", rotulo: "Permissões" },
  { to: "/painel/auditoria", rotulo: "Registo de actividade" },
  { to: "/formacao", rotulo: "Cursos" },
  { to: "/", rotulo: "Site" },
];

const AUDITOR: LigacaoPainel[] = [
  { to: "/painel", rotulo: "Início" },
  { to: "/painel/utilizadores", rotulo: "Utilizadores" },
  { to: "/painel/permissoes", rotulo: "Permissões" },
  { to: "/painel/auditoria", rotulo: "Registo de actividade" },
  { to: "/formacao", rotulo: "Cursos" },
  { to: "/", rotulo: "Site" },
];

export function ligacoesDoPainel(papelActivo: PapelSistema | null): LigacaoPainel[] {
  if (papelActivo === "admin_atdi") return ADMIN;
  if (papelActivo === "auditor_atdi") return AUDITOR;
  return COMUNS;
}

/**
 * Destino depois de entrar. É sempre um caminho interno fixo desta aplicação:
 * não se lê nenhum endereço vindo do navegador, logo não há reencaminhamento
 * para fora nem ciclos de entrada.
 */
export function destinoAposEntrada(): "/painel" {
  return "/painel";
}
