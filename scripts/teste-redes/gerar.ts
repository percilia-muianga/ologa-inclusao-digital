/** Gera, para a base EFÉMERA, as fixtures do curso de Redes (IDs reais, sem conteúdo) e o pacote. */
import { writeFileSync } from "node:fs";
import { LICOES_PLANO, MODULOS_PLANO, SLUG_CURSO } from "../../src/lib/plano-redes";
import { ID_CURSO_REDES, ID_MODULO_TRANSVERSAL, IDS_MODULOS_REDES, IDS_LICOES_REDES } from "../conteudo/redes-ids";
import { payloadRedes } from "../../src/lib/conteudos-preparados.server";
const q = (s: string) => `'${s.replaceAll("'", "''")}'`;
const out: string[] = [];
out.push(`INSERT INTO public.cursos(id, ordem, slug, titulo, carga_horaria, modalidade, formandos_previstos) VALUES (${q(ID_CURSO_REDES)}, 5, ${q(SLUG_CURSO)}, 'Redes (teste)', 80, 'presencial', 10), ('00000000-0000-0000-0000-00000000c0f2', 6, 'outro-curso', 'Outro curso (teste)', 10, 'presencial', 10);`);
out.push(`INSERT INTO public.modulos(id, ordem, titulo, descricao) VALUES (${q(ID_MODULO_TRANSVERSAL)}, 99, 'Transversal (teste)', 'DESCRICAO TRANSVERSAL ORIGINAL');`);
for (const m of MODULOS_PLANO) out.push(`INSERT INTO public.modulos(id, ordem, titulo) VALUES (${q(IDS_MODULOS_REDES[m.ordem - 1]!)}, ${m.ordem}, ${q(m.titulo)});`);
for (const m of MODULOS_PLANO) out.push(`INSERT INTO public.curso_modulos(curso_id, modulo_id, ordem, carga_horaria_minutos, obrigatorio, transversal) VALUES (${q(ID_CURSO_REDES)}, ${q(IDS_MODULOS_REDES[m.ordem - 1]!)}, ${m.ordem}, 590, true, false);`);
out.push(`INSERT INTO public.curso_modulos(curso_id, modulo_id, ordem, carga_horaria_minutos, obrigatorio, transversal) VALUES (${q(ID_CURSO_REDES)}, ${q(ID_MODULO_TRANSVERSAL)}, 13, 120, true, true), ('00000000-0000-0000-0000-00000000c0f2', ${q(ID_MODULO_TRANSVERSAL)}, 2, 90, true, true);`);
for (const l of LICOES_PLANO) out.push(`INSERT INTO public.licoes(id, modulo_id, ordem, titulo, estado_conteudo) VALUES (${q(IDS_LICOES_REDES[l.chave]!)}, ${q(IDS_MODULOS_REDES[l.modulo - 1]!)}, ${l.ordem}, ${q(l.titulo)}, 'por_fornecer');`);
writeFileSync(process.argv[2] + "/fixtures.sql", out.join("\n") + "\n");
writeFileSync(process.argv[2] + "/payload.json", JSON.stringify(payloadRedes()));
console.log("fixtures e pacote gerados");
