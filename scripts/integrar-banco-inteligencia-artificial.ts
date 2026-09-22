/**
 * Integração RESTRITA do banco de avaliação do curso «Introdução à
 * Inteligência Artificial» (80 questões finais + 10 de diagnóstico).
 *
 * Regras que este comando cumpre, sem excepção:
 * - Escreve APENAS na tabela banco_questoes e APENAS para este curso.
 * - Todas as questões entram INACTIVAS (activa = false) e em estado de
 *   revisão «rascunho». O motor de exame só sorteia questões activas, pelo
 *   que nada fica operacional e nenhuma prova é activada.
 * - NÃO toca em lições, módulos, outros cursos, outros bancos, turmas,
 *   presenças, exame_configuracoes, tentativas, certificados, perfis nem
 *   permissões.
 * - NÃO usa a chave de serviço. Autentica-se como pessoa administradora, para
 *   que auth.uid() seja real, as políticas de segurança se apliquem e o
 *   registo de auditoria fique com autor verdadeiro. Nenhum gatilho é
 *   desactivado e nenhum actor é inventado.
 * - Idempotente: a chave é (curso, instrumento, enunciado). Repetir a
 *   execução actualiza, nunca duplica.
 * - Importar este ficheiro não tem efeitos: só o comando explícito escreve.
 *
 * Correr o plano, sem escrever nada:
 *   bun run scripts/integrar-banco-inteligencia-artificial.ts --plano
 * Integrar (exige sessão de administração):
 *   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... \
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *   bun run scripts/integrar-banco-inteligencia-artificial.ts --integrar
 */
import { createClient } from "@supabase/supabase-js";
import {
  EXAME_IA,
  DIAGNOSTICO_IA,
  type QuestaoIA,
} from "./conteudo/inteligencia-artificial-questoes";

export const SLUG_CURSO = "introducao-inteligencia-artificial";
export const AUTOR_NOME = "Equipa pedagógica Ologa (rascunho)";
export const VERSAO_BANCO = "v1";

const TIPOLOGIA = {
  em: "escolha_multipla",
  vf: "verdadeiro_falso",
  cor: "correspondencia",
} as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

/** Ordem do módulo no curso, por chave do plano. */
export const ORDEM_MODULO: Record<QuestaoIA["m"], number> = {
  m1: 1,
  m2: 2,
  transversal: 3,
};

export type LinhaBanco = {
  cod: string;
  ordemModulo: number;
  instrumento: "exame_final" | "pre_pos_teste";
  tipologia: (typeof TIPOLOGIA)[keyof typeof TIPOLOGIA];
  dificuldade: (typeof DIFICULDADE)[keyof typeof DIFICULDADE];
  enunciado: string;
  conteudo: Record<string, unknown>;
  resposta: Record<string, unknown>;
  explicacao: string;
  objectivo_associado: string;
  cenario: boolean;
  activa: false;
  estado_revisao: "rascunho";
  versao: string;
  autor_nome: string;
};

function corpo(q: QuestaoIA): { conteudo: Record<string, unknown>; resposta: Record<string, unknown> } {
  switch (q.t) {
    case "em":
      if (!q.opts || q.ind === undefined) throw new Error(`Item sem opções: ${q.cod}`);
      if (q.ind < 0 || q.ind >= q.opts.length) throw new Error(`Gabarito fora do intervalo: ${q.cod}`);
      return {
        conteudo: { opcoes: q.opts, ...(q.cen ? { cenario: true } : {}) },
        resposta: { indice: q.ind },
      };
    case "vf":
      if (q.val === undefined) throw new Error(`Item sem valor: ${q.cod}`);
      return { conteudo: q.cen ? { cenario: true } : {}, resposta: { valor: q.val } };
    case "cor":
      if (!q.pares || q.pares.length < 3) throw new Error(`Associação sem pares suficientes: ${q.cod}`);
      return { conteudo: { pares: q.pares }, resposta: { pares: q.pares } };
  }
}

/**
 * Plano de integração: função pura, sem base de dados e sem efeitos.
 * É o que os testes verificam antes de qualquer escrita existir.
 */
export function planoIntegracao(): LinhaBanco[] {
  const linhas: LinhaBanco[] = [];
  const vistos = new Set<string>();
  const adicionar = (q: QuestaoIA, instrumento: LinhaBanco["instrumento"]) => {
    const chave = `${instrumento}||${q.e.trim()}`;
    if (vistos.has(chave)) throw new Error(`Enunciado repetido no mesmo instrumento: ${q.cod}`);
    vistos.add(chave);
    const { conteudo, resposta } = corpo(q);
    linhas.push({
      cod: q.cod,
      ordemModulo: ORDEM_MODULO[q.m],
      instrumento,
      tipologia: TIPOLOGIA[q.t],
      dificuldade: DIFICULDADE[q.d],
      enunciado: q.e.trim(),
      conteudo,
      resposta,
      explicacao: q.exp,
      objectivo_associado: q.obj,
      cenario: Boolean(q.cen),
      activa: false,
      estado_revisao: "rascunho",
      versao: VERSAO_BANCO,
      autor_nome: AUTOR_NOME,
    });
  };
  for (const q of EXAME_IA) adicionar(q, "exame_final");
  for (const q of DIAGNOSTICO_IA) adicionar(q, "pre_pos_teste");
  return linhas;
}

/** Resumo do plano, sem enunciados nem gabaritos. */
export function resumoPlano(linhas: LinhaBanco[]) {
  const contar = (vals: string[]) =>
    vals.reduce<Record<string, number>>((r, v) => ({ ...r, [v]: (r[v] ?? 0) + 1 }), {});
  const exame = linhas.filter((l) => l.instrumento === "exame_final");
  return {
    total: linhas.length,
    exame_final: exame.length,
    pre_pos_teste: linhas.length - exame.length,
    porModulo: contar(exame.map((l) => `módulo ${l.ordemModulo}`)),
    porTipo: contar(exame.map((l) => (l.cenario ? "cenario" : l.tipologia))),
    porDificuldade: contar(exame.map((l) => l.dificuldade)),
    activas: linhas.filter((l) => l.activa).length,
  };
}

// ---------------------------------------------------------------------------
// Comando explícito. Nada corre por importação.
// ---------------------------------------------------------------------------

async function integrar(linhas: LinhaBanco[]) {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const anon =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const email = process.env["ADMIN_EMAIL"];
  const palavra = process.env["ADMIN_PASSWORD"];
  if (process.env["SUPABASE_SERVICE_ROLE_KEY"] && !email) {
    throw new Error(
      "Este comando não usa a chave de serviço. Exige sessão de administração real (ADMIN_EMAIL/ADMIN_PASSWORD).",
    );
  }
  if (!url || !anon) throw new Error("Faltam SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
  if (!email || !palavra)
    throw new Error(
      "INTEGRAÇÃO PENDENTE: faltam ADMIN_EMAIL e ADMIN_PASSWORD de uma conta com perfil de administração. Sem sessão real não há actor verificado nem auditoria; nada é escrito.",
    );

  const sb = createClient(url, anon, { auth: { persistSession: false } });
  const { data: sessao, error: erroSessao } = await sb.auth.signInWithPassword({
    email,
    password: palavra,
  });
  if (erroSessao || !sessao.user) throw new Error("Sessão de administração recusada. Nada foi escrito.");

  const { data: curso, error: e1 } = await sb
    .from("cursos")
    .select("id")
    .eq("slug", SLUG_CURSO)
    .maybeSingle();
  if (e1) throw e1;
  if (!curso) throw new Error(`Curso ${SLUG_CURSO} não encontrado`);

  const { data: rel, error: e2 } = await sb
    .from("curso_modulos")
    .select("modulo_id,ordem,modulos(ordem)")
    .eq("curso_id", curso.id);
  if (e2) throw e2;
  const moduloPorOrdem = new Map<number, string>();
  for (const r of rel ?? []) moduloPorOrdem.set(r.ordem, r.modulo_id);

  const { data: existentes, error: e3 } = await sb
    .from("banco_questoes")
    .select("id,instrumento,enunciado")
    .eq("curso_id", curso.id);
  if (e3) throw e3;
  const porChave = new Map<string, string>();
  for (const r of existentes ?? []) porChave.set(`${r.instrumento}||${r.enunciado.trim()}`, r.id);

  let inseridas = 0;
  let actualizadas = 0;
  for (const l of linhas) {
    const modulo_id = moduloPorOrdem.get(l.ordemModulo) ?? null;
    const registo = {
      curso_id: curso.id,
      modulo_id,
      instrumento: l.instrumento,
      tipologia: l.tipologia,
      dificuldade: l.dificuldade,
      enunciado: l.enunciado,
      conteudo: l.conteudo,
      resposta: l.resposta,
      explicacao: l.explicacao,
      objectivo_associado: l.objectivo_associado,
      cenario: l.cenario,
      activa: false,
      estado_revisao: l.estado_revisao,
      versao: l.versao,
      autor_id: sessao.user.id,
      autor_nome: l.autor_nome,
    };
    const id = porChave.get(`${l.instrumento}||${l.enunciado}`);
    if (id) {
      const { error } = await sb.from("banco_questoes").update(registo).eq("id", id);
      if (error) throw error;
      actualizadas++;
    } else {
      const { error } = await sb.from("banco_questoes").insert(registo);
      if (error) throw error;
      inseridas++;
    }
  }
  await sb.auth.signOut();
  console.log(`Integração concluída: ${inseridas} inseridas, ${actualizadas} actualizadas, 0 activadas.`);
}

async function main() {
  const linhas = planoIntegracao();
  const arg = process.argv[2];
  if (arg === "--integrar") {
    await integrar(linhas);
    return;
  }
  console.log("PLANO (nada é escrito):", JSON.stringify(resumoPlano(linhas), null, 2));
  if (arg !== "--plano")
    console.log("Use --plano para ver o plano ou --integrar para gravar com sessão de administração.");
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
