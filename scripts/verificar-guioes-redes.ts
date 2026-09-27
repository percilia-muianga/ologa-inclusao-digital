/** Verifica que o último intervalo de cada guião termina na duração planeada da lição. */
import { LICOES_PLANO } from "../src/lib/plano-redes";
import { LICOES_M01_03 } from "./conteudo/redes-m01-03";
import { LICOES_M04_06 } from "./conteudo/redes-m04-06";
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
if (import.meta.main) {
  const e = verificarGuioes({ ...LICOES_M01_03, ...LICOES_M04_06 });
  console.log(e.length ? e.join("\n") : "Guiões coerentes com a duração.");
}
