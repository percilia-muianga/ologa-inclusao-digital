// Importa conteúdo formativo (modulos, licoes, quiz_perguntas) via service role.
// Upsert idempotente: nunca apaga (progresso_licoes tem CASCADE sobre licoes).
// Correr: node scripts/importar-conteudo.mjs <caminho-json>
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const NIVEL_MAP = { 'Básico': 'basico', 'Intermédio': 'intermedio', 'Avançado': 'avancado' };

const path = process.argv[2];
if (!path) { console.error('Uso: node scripts/importar-conteudo.mjs <ficheiro.json>'); process.exit(1); }

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const fetchShim = (input, init) => {
  const h = new Headers(init?.headers);
  if ((key.startsWith('sb_secret_') || key.startsWith('sb_publishable_')) && h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization');
  h.set('apikey', key);
  return fetch(input, { ...init, headers: h });
};
const sb = createClient(url, key, { auth: { persistSession: false }, global: { fetch: fetchShim } });

const dados = JSON.parse(readFileSync(path, 'utf8'));

let nModulos = 0, nLicoes = 0, nQuiz = 0, licoesComSvg = 0;

for (const m of dados.modulos) {
  const nivel = NIVEL_MAP[m.nivel];
  if (!nivel) throw new Error(`Nível desconhecido: ${m.nivel}`);
  const ordem = m.id;

  // Upsert módulo por ordem
  const { data: existente, error: eSel } = await sb.from('modulos').select('id').eq('ordem', ordem).maybeSingle();
  if (eSel) throw eSel;
  const patch = { ordem, titulo: m.titulo, nivel, duracao: m.duracao, descricao: m.descricao, desenho_universal: m.desenho_universal, icone: null };
  let moduloId;
  if (existente) {
    moduloId = existente.id;
    const { error } = await sb.from('modulos').update(patch).eq('id', moduloId);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('modulos').insert(patch).select('id').single();
    if (error) throw error;
    moduloId = data.id;
  }
  nModulos++;

  // Lições: upsert por (modulo_id, ordem)
  const { data: licoesExist, error: eL } = await sb.from('licoes').select('id, ordem').eq('modulo_id', moduloId);
  if (eL) throw eL;
  const mapaLicoes = new Map(licoesExist.map(l => [l.ordem, l.id]));
  for (const l of m.licoes) {
    const p = { modulo_id: moduloId, ordem: l.ordem, titulo: l.titulo, duracao: l.duracao, ilustracao_svg: l.ilustracao_svg, conteudo_elearning: l.conteudo_elearning, guiao_formador: l.guiao_formador };
    if (mapaLicoes.has(l.ordem)) {
      const { error } = await sb.from('licoes').update(p).eq('id', mapaLicoes.get(l.ordem));
      if (error) throw error;
    } else {
      const { error } = await sb.from('licoes').insert(p);
      if (error) throw error;
    }
    nLicoes++;
    if (l.ilustracao_svg && l.ilustracao_svg.trim().length > 0) licoesComSvg++;
  }

  // Quiz: sem chave natural — match por posição (ordenado por id/inserção)
  const { data: quizExist, error: eQ } = await sb.from('quiz_perguntas').select('id').eq('modulo_id', moduloId).order('id', { ascending: true });
  if (eQ) throw eQ;
  for (let i = 0; i < m.quiz.length; i++) {
    const q = m.quiz[i];
    const p = { modulo_id: moduloId, pergunta: q.pergunta, opcoes: q.opcoes, resposta_correta_indice: q.resposta_correta_indice };
    if (i < quizExist.length) {
      const { error } = await sb.from('quiz_perguntas').update(p).eq('id', quizExist[i].id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('quiz_perguntas').insert(p);
      if (error) throw error;
    }
    nQuiz++;
  }
}

console.log(JSON.stringify({ nModulos, nLicoes, nQuiz, licoesComSvg }, null, 2));
