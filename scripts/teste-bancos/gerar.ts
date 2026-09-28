/** Fixtures para a base EFÉMERA: 3 cursos com a ordem real dos módulos + um curso alheio com 1 questão. */
import { writeFileSync } from "node:fs";
import { payloadBanco, type PacoteBanco } from "../../src/lib/conteudos-preparados.server";
const TR = "3d0dd3a0-a53b-4800-a032-68527d708eb1";
const CURSOS: [PacoteBanco, string, string, number][] = [
  ["banco-seguranca-cibernetica", "00000000-0000-0000-0000-0000000000b1", "seguranca-cibernetica-avancada", 3],
  ["banco-tecnologias-governo", "00000000-0000-0000-0000-0000000000b2", "tecnologias-digitais-governo", 1],
  ["banco-redes", "00000000-0000-0000-0000-0000000000b3", "redes-avancadas-seguranca-cibernetica", 12],
];
const out: string[] = [];
out.push(`INSERT INTO public.modulos(id, ordem, titulo) VALUES ('${TR}', 200, 'Transversal (teste)');`);
out.push(`INSERT INTO public.cursos(id, ordem, slug, titulo, carga_horaria, modalidade, formandos_previstos) VALUES ('00000000-0000-0000-0000-0000000000b9', 9, 'outro-curso', 'Outro (teste)', 10, 'presencial', 10);`);
out.push(`INSERT INTO public.curso_modulos(curso_id, modulo_id, ordem, carga_horaria_minutos, obrigatorio, transversal) VALUES ('00000000-0000-0000-0000-0000000000b9', '${TR}', 1, 120, true, true);`);
CURSOS.forEach(([, id, slug, n], i) => {
  out.push(`INSERT INTO public.cursos(id, ordem, slug, titulo, carga_horaria, modalidade, formandos_previstos) VALUES ('${id}', ${i + 1}, '${slug}', 'Teste', 10, 'presencial', 10);`);
  for (let o = 1; o <= n; o++) {
    const m = `00000000-0000-0000-00${String(i + 1).padStart(2, "0")}-${String(o).padStart(12, "0")}`;
    out.push(`INSERT INTO public.modulos(id, ordem, titulo) VALUES ('${m}', ${1000 * (i + 1) + o}, 'M${o}');`);
    out.push(`INSERT INTO public.curso_modulos(curso_id, modulo_id, ordem, carga_horaria_minutos, obrigatorio, transversal) VALUES ('${id}', '${m}', ${o}, 60, true, false);`);
  }
  out.push(`INSERT INTO public.curso_modulos(curso_id, modulo_id, ordem, carga_horaria_minutos, obrigatorio, transversal) VALUES ('${id}', '${TR}', ${n + 1}, 120, true, true);`);
});
writeFileSync(process.argv[2] + "/fixtures.sql", out.join("\n") + "\n");
for (const [p] of CURSOS) writeFileSync(`${process.argv[2]}/${p}.json`, JSON.stringify(payloadBanco(p)));
console.log("fixtures e 3 pacotes gerados");
