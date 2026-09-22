/**
 * Integração RESTRITA do curso «Segurança Cibernética Avançada».
 *
 * Âmbito máximo, mesmo no modo de gravação:
 *  - actualiza as 15 lições JÁ EXISTENTES (título, duração, conteúdo, guião);
 *  - actualiza a descrição dos três módulos do curso.
 * Nunca cria nem apaga lições, módulos ou cursos; nunca toca no módulo
 * transversal, noutros cursos, no banco de questões, em exames, turmas,
 * presenças, certificados, perfis ou permissões.
 *
 * Modos:
 *   bun run scripts/integrar-seguranca-cibernetica.ts --plano
 *      Simulação. NÃO escreve nada. Monta as lições, resolve os identificadores
 *      existentes por leitura e imprime o que seria alterado.
 *   bun run scripts/integrar-seguranca-cibernetica.ts --integrar
 *      Grava. Exige sessão real de administrador (ADMIN_EMAIL/ADMIN_PASSWORD) e
 *      a chave publicável. RLS e auditoria aplicam-se normalmente.
 *
 * A chave de serviço é rejeitada de propósito: as políticas destas tabelas
 * exigem sessão autenticada com is_admin(auth.uid()) e a autoria tem de ficar
 * registada numa pessoa real.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MODULOS_PLANO, SLUG_CURSO } from "../src/lib/plano-seguranca-cibernetica";
import { DESCRICOES_MODULO, montarTodas, type LicaoMontada } from "./conteudo/seguranca-cibernetica-licoes";

const args = new Set(process.argv.slice(2));
const gravar = args.has("--integrar");
if (!gravar && !args.has("--plano")) {
  throw new Error("Indique --plano (simulação, sem escrita) ou --integrar (grava).");
}

function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

async function ligar(): Promise<SupabaseClient> {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Faltam SUPABASE_URL e a chave publicável.");
  if (process.env["SUPABASE_SERVICE_ROLE_KEY"] && gravar) {
    throw new Error("Este integrador não usa chave de serviço. Remova SUPABASE_SERVICE_ROLE_KEY.");
  }
  const fetchShim = (input: RequestInfo | URL, init?: RequestInit) => {
    const h = new Headers(init?.headers);
    if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
    h.set("apikey", key);
    return fetch(input, { ...init, headers: h });
  };
  const sb = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: fetchShim as typeof fetch },
  });
  if (gravar) {
    const email = process.env["ADMIN_EMAIL"];
    const password = process.env["ADMIN_PASSWORD"];
    if (!email || !password) {
      throw new Error(
        "Integração pendente: sem ADMIN_EMAIL/ADMIN_PASSWORD não há sessão de administrador e nada é gravado.",
      );
    }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Sessão de administrador não estabelecida; nada foi gravado.");
  }
  return sb;
}

type Alvo = { licao: LicaoMontada; id: string | null };

async function main() {
  const montadas = montarTodas();
  if (montadas.length !== 15) throw new Error(`Esperadas 15 lições montadas, obtidas ${montadas.length}`);

  const sb = await ligar();

  const curso = must(await sb.from("cursos").select("id").eq("slug", SLUG_CURSO).maybeSingle());
  if (!curso) throw new Error(`Curso ${SLUG_CURSO} não encontrado`);

  const rel = must(
    await sb
      .from("curso_modulos")
      .select("modulo_id,ordem")
      .eq("curso_id", (curso as { id: string }).id),
  ) as { modulo_id: string; ordem: number }[];

  const alvos: Alvo[] = [];
  const modulos: { chave: string; modulo_id: string; descricao: string | undefined }[] = [];

  for (const m of MODULOS_PLANO.filter((x) => !x.transversal)) {
    const ligacao = rel.find((r) => r.ordem === m.ordem);
    if (!ligacao) throw new Error(`Módulo de ordem ${m.ordem} não está ligado ao curso`);
    modulos.push({ chave: m.chave, modulo_id: ligacao.modulo_id, descricao: DESCRICOES_MODULO[m.chave] });
    for (const l of montadas.filter((x) => x.moduloChave === m.chave)) {
      const existente = must(
        await sb
          .from("licoes")
          .select("id")
          .eq("modulo_id", ligacao.modulo_id)
          .eq("ordem", l.ordem)
          .maybeSingle(),
      ) as { id: string } | null;
      if (!existente) throw new Error(`Lição ${l.chave} não existe na base — não é criada aqui`);
      alvos.push({ licao: l, id: existente.id });
    }
  }

  if (!gravar) {
    console.log(
      JSON.stringify(
        {
          modo: "plano (simulação, nenhuma escrita)",
          curso: SLUG_CURSO,
          licoes: alvos.map((a) => ({
            chave: a.licao.chave,
            id: a.id,
            titulo: a.licao.titulo,
            minutos: a.licao.minutos,
            laboratorio: a.licao.laboratorio,
            caracteresConteudo: a.licao.elearning.length,
            caracteresGuiao: a.licao.guiao.length,
          })),
          modulos: modulos.map((m) => ({ chave: m.chave, id: m.modulo_id, descricao: Boolean(m.descricao) })),
          naoAlterado: [
            "ficha do curso (cursos.*)",
            "curso_modulos (ligações e cargas)",
            "módulo transversal",
            "banco de questões, exames e configurações de avaliação",
          ],
        },
        null,
        2,
      ),
    );
    return;
  }

  const actualizadas: string[] = [];
  for (const a of alvos) {
    must(
      await sb
        .from("licoes")
        .update({
          titulo: a.licao.titulo,
          duracao: `${a.licao.minutos} minutos`,
          duracao_minutos: a.licao.minutos,
          conteudo_elearning: a.licao.elearning,
          guiao_formador: a.licao.guiao,
          estado_conteudo: "disponivel",
          proposta_por_validar: false,
        })
        .eq("id", a.id!)
        .select("id"),
    );
    actualizadas.push(`${a.licao.chave} (${a.id})`);
  }
  for (const m of modulos) {
    if (m.descricao) {
      must(await sb.from("modulos").update({ descricao: m.descricao }).eq("id", m.modulo_id).select("id"));
    }
  }
  console.log(JSON.stringify({ modo: "integrar", actualizadas, modulos: modulos.length }, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
