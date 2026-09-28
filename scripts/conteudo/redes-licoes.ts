/**
 * Agregador das 60 lições do curso de Redes (módulos 1 a 12).
 *
 * Só junta os ficheiros já escritos e monta o HTML com as funções comuns de
 * redes-base.ts. Não altera nenhum conteúdo. Vive fora de src/ e só é
 * importado pelo módulo privado conteudos-preparados.server.ts, pelos testes
 * e pelos scripts: nunca entra no pacote do navegador.
 */
import { LICOES_PLANO } from "../../src/lib/plano-redes";
import { montarElearning, montarGuiao, type ConteudoLicao } from "./redes-base";
import { LICOES_M01_03 } from "./redes-m01-03";
import { LICOES_M04_06 } from "./redes-m04-06";
import { LICOES_M07 } from "./redes-m07";
import { LICOES_M08 } from "./redes-m08";
import { LICOES_M09 } from "./redes-m09";
import { LICOES_M10 } from "./redes-m10";
import { LICOES_M11 } from "./redes-m11";
import { LICOES_M12 } from "./redes-m12";

const PARTES: Record<string, ConteudoLicao>[] = [
  LICOES_M01_03, LICOES_M04_06, LICOES_M07, LICOES_M08,
  LICOES_M09, LICOES_M10, LICOES_M11, LICOES_M12,
];

/** Todas as lições escritas; falha se alguma chave estiver repetida entre ficheiros. */
export const LICOES_REDES: Record<string, ConteudoLicao> = (() => {
  const todas: Record<string, ConteudoLicao> = {};
  for (const parte of PARTES) {
    for (const [chave, c] of Object.entries(parte)) {
      if (todas[chave]) throw new Error(`LICAO_REPETIDA:${chave}`);
      todas[chave] = c;
    }
  }
  return todas;
})();

export type LicaoRedesMontada = {
  chave: string;
  modulo_ordem: number;
  ordem: number;
  titulo: string;
  minutos: number;
  elearning: string;
  guiao: string;
};

/** Monta as 60 lições pela ordem do plano. Falha se faltar ou sobrar alguma. */
export function montarTodasRedes(): LicaoRedesMontada[] {
  const chavesPlano = new Set(LICOES_PLANO.map((l) => l.chave));
  for (const k of Object.keys(LICOES_REDES)) if (!chavesPlano.has(k)) throw new Error(`LICAO_FORA_DO_PLANO:${k}`);
  return LICOES_PLANO.map((l) => {
    const c = LICOES_REDES[l.chave];
    if (!c) throw new Error(`LICAO_EM_FALTA:${l.chave}`);
    return {
      chave: l.chave,
      modulo_ordem: l.modulo,
      ordem: l.ordem,
      titulo: l.titulo,
      minutos: l.minutos,
      elearning: montarElearning(c, l),
      guiao: montarGuiao(c, l),
    };
  });
}
