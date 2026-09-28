/** Verifica que os intervalos de cada guião são contínuos e terminam na duração planeada da lição. */
import { LICOES_PLANO } from "../src/lib/plano-redes";
import { LICOES_M01_03 } from "./conteudo/redes-m01-03";
import { LICOES_M04_06 } from "./conteudo/redes-m04-06";
import { LICOES_M07 } from "./conteudo/redes-m07";
import { LICOES_M08 } from "./conteudo/redes-m08";
import { LICOES_M09 } from "./conteudo/redes-m09";
import { LICOES_M10 } from "./conteudo/redes-m10";
import { LICOES_M11 } from "./conteudo/redes-m11";
import { LICOES_M12 } from "./conteudo/redes-m12";

export function verificarGuioes(conteudos: Record<string, { guiao: { conducao: string[] } }>) {
  const erros: string[] = [];
  for (const l of LICOES_PLANO) {
    const c = conteudos[l.chave];
    if (!c) continue;
    let fimAnterior = 0;
    for (const linha of c.guiao.conducao) {
      const m = linha.match(/^(\d+)\s*[–-]\s*(\d+)\s*min/);
      if (!m) { erros.push(`${l.chave}: linha sem intervalo: ${linha.slice(0, 40)}`); continue; }
      const [a, b] = [Number(m[1]), Number(m[2])];
      if (a !== fimAnterior) erros.push(`${l.chave}: intervalo começa em ${a}, esperado ${fimAnterior}`);
      fimAnterior = b;
    }
    if (fimAnterior !== l.minutos) erros.push(`${l.chave}: guião termina em ${fimAnterior} min, plano ${l.minutos}`);
  }
  return erros;
}

export const CONTEUDOS_ESCRITOS = { ...LICOES_M01_03, ...LICOES_M04_06, ...LICOES_M07, ...LICOES_M08, ...LICOES_M09, ...LICOES_M10, ...LICOES_M11, ...LICOES_M12 };

if (import.meta.main) {
  const e = verificarGuioes(CONTEUDOS_ESCRITOS);
  console.log(`${Object.keys(CONTEUDOS_ESCRITOS).length} lições verificadas.`);
  console.log(e.length ? e.join("\n") : "Guiões coerentes com a duração.");
}
