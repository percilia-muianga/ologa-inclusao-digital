/**
 * Agregação das 15 lições do curso «Segurança Cibernética Avançada».
 *
 * Junta os conteúdos escritos em M1, M2 e M3, liga cada chave do plano ao
 * respectivo conteúdo e gera o HTML da lição e do guião do formador.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador.
 */
import type { LicaoPlano } from "../../src/lib/plano-seguranca-cibernetica";
import { MODULOS_PLANO } from "../../src/lib/plano-seguranca-cibernetica";
import type { ConteudoLicao } from "./seguranca-cibernetica-base";
import { montarElearning, montarGuiao } from "./seguranca-cibernetica-base";
import { LICOES_M1 } from "./seguranca-cibernetica-m1";
import { LICOES_M2 } from "./seguranca-cibernetica-m2";
import { LICOES_M3 } from "./seguranca-cibernetica-m3";

export const LICOES: Record<string, ConteudoLicao> = {
  ...LICOES_M1,
  ...LICOES_M2,
  ...LICOES_M3,
};

export const DESCRICOES_MODULO: Record<string, string> = Object.fromEntries(
  MODULOS_PLANO.filter((m) => !m.transversal && m.descricao).map((m) => [m.chave, m.descricao!]),
);

export type LicaoMontada = {
  chave: string;
  moduloChave: string;
  moduloOrdem: number;
  ordem: number;
  titulo: string;
  minutos: number;
  laboratorio: boolean;
  elearning: string;
  guiao: string;
};

/** Monta uma lição do plano com o conteúdo escrito. Lança se faltar conteúdo. */
export function montarLicao(moduloChave: string, moduloOrdem: number, l: LicaoPlano): LicaoMontada {
  const conteudo = LICOES[l.chave];
  if (!conteudo) throw new Error(`Sem conteúdo escrito para a lição ${l.chave}`);
  if (Boolean(conteudo.laboratorio) !== l.laboratorio) {
    throw new Error(
      `Lição ${l.chave}: o plano declara laboratorio=${l.laboratorio} e o conteúdo escrito diz o contrário`,
    );
  }
  return {
    chave: l.chave,
    moduloChave,
    moduloOrdem,
    ordem: l.ordem,
    titulo: l.titulo,
    minutos: l.minutos,
    laboratorio: l.laboratorio,
    elearning: montarElearning(conteudo, l.minutos, l.tempos),
    guiao: montarGuiao(conteudo, l.titulo, l.minutos, l.tempos),
  };
}

/** As 15 lições montadas, pela ordem dos módulos. Não escreve nada. */
export function montarTodas(): LicaoMontada[] {
  return MODULOS_PLANO.filter((m) => !m.transversal).flatMap((m) =>
    m.licoes.map((l) => montarLicao(m.chave, m.ordem, l)),
  );
}
