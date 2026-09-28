/** Gera docs/matriz-redes-r01-r18.md a partir do plano e dos critérios C01–C18 (sem inventar ligações). */
import { writeFileSync } from "node:fs";
import { LICOES_PLANO, RESULTADOS_TDR, type ResultadoTdr } from "../src/lib/plano-redes";
import { ACTIVIDADE_INTEGRADA } from "./conteudo/redes-m12";
const ls: string[] = [];
ls.push("# Matriz R01–R18 ↔ lições ↔ evidência — Administração de Redes e Segurança Cibernética", "");
ls.push("Gerada por `scripts/gerar-matriz-redes.ts` a partir de `src/lib/plano-redes.ts` e dos critérios C01–C18 de `scripts/conteudo/redes-m12.ts`. Não editar à mão.", "");
ls.push("**Estado:** proposta pedagógica interna, **por validar** pela Ologa/ATDI. O texto original completo dos TdR não está disponível nesta ferramenta; R01–R18 são o resumo interno da secção 6.5 (pp. 16–17). Carga 80 h (sec. 14) vs. 120 h (sec. 6.5): contradição por esclarecer pela ATDI. Laboratórios em máquina virtual **não executados**: as saídas nas lições são exemplos didácticos.", "");
ls.push("| Resultado | Lições que o trabalham | Evidência na actividade integrada |", "| --- | --- | --- |");
for (const r of Object.keys(RESULTADOS_TDR) as ResultadoTdr[]) {
  const lic = LICOES_PLANO.filter((l) => l.resultados.includes(r)).map((l) => `M${l.modulo}.L${l.ordem} ${l.titulo}`);
  const crit = ACTIVIDADE_INTEGRADA.criterios.filter((c) => c.resultados.includes(r)).map((c) => `${c.id}: ${c.evidencia}`);
  ls.push(`| ${r} — ${RESULTADOS_TDR[r]} | ${lic.join("<br>")} | ${crit.join("<br>")} |`);
}
ls.push("", "Em cada lição, a evidência formativa é a mesma estrutura: critérios de sucesso da prática (ou respostas da alternativa em papel) e as 2 questões comentadas.", "");
ls.push("## Carga horária proposta (4800 min = 80 h)", "", "- 60 lições: 4560 min (12 módulos × 380 min; lições de 70/75/75/80/80).", "- Módulo transversal Governo Digital Inclusivo e Acessibilidade: 120 min, partilhado com os outros cursos (o módulo em si não é alterado; só a linha que o liga a este curso).", "- Avaliação e orientação: 120 min (diagnóstico 20, revisão 40, exame 60). A inclusão do transversal e da avaliação nas 80 h é proposta interna por validar.", "");
writeFileSync("docs/matriz-redes-r01-r18.md", ls.join("\n"));
console.log("matriz gerada");
