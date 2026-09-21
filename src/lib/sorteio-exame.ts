/**
 * Sorteio do exame final com COBERTURA GARANTIDA.
 *
 * O motor anterior só equilibrava a dificuldade: a presença de todos os
 * módulos e de todas as tipologias era provável, não garantida. Este módulo
 * resolve as três restrições em conjunto — módulo, tipologia pedagógica e
 * dificuldade — e sorteia ao acaso ENTRE as selecções viáveis.
 *
 * Propriedades:
 * - determinístico dada uma semente; aleatório sem semente;
 * - não é ganancioso: percorre o espaço de repartições com retrocesso, pelo
 *   que não perde soluções viáveis por ter escolhido mal no início;
 * - finito: tem um limite de trabalho explícito e, se o esgotar, devolve erro
 *   em vez de entregar uma prova incompleta;
 * - nunca completa em silêncio: se as restrições forem impossíveis, bloqueia a
 *   prova com a causa.
 *
 * Este ficheiro é puro: não lê a base de dados, não conhece gabaritos.
 */

export type DificuldadeSorteio = "facil" | "media" | "dificil";

export type TipologiaSorteio =
  | "escolha_multipla"
  | "verdadeiro_falso"
  | "resposta_curta"
  | "correspondencia"
  | "ordenacao";

/**
 * Tipo pedagógico. «cenario» é uma categoria própria do plano de formação,
 * mesmo quando usa escolha múltipla como formato de resposta. A classificação
 * vem de um metadado da questão, nunca de heurística sobre o texto.
 */
export type TipoPedagogico = TipologiaSorteio | "cenario";

export type QuestaoSorteavel = {
  id: string;
  moduloId: string | null;
  tipologia: TipologiaSorteio;
  dificuldade: DificuldadeSorteio;
  cenario: boolean;
};

export type QuotasExame = {
  total: number;
  dificuldade: Record<DificuldadeSorteio, number>;
  /** Chave = identificador do módulo; valor = quantas questões desse módulo. */
  modulos: Record<string, number>;
  /** Chave = tipo pedagógico; valor = quantas questões desse tipo. */
  tipos: Partial<Record<TipoPedagogico, number>>;
};

export type CausaBloqueio =
  | "QUOTAS_INCOERENTES"
  | "MODULO_SEM_QUESTOES"
  | "TIPO_SEM_QUESTOES"
  | "DIFICULDADE_SEM_QUESTOES"
  | "COMBINACAO_IMPOSSIVEL"
  | "LIMITE_DE_TRABALHO";

export type ResultadoSorteio =
  | { ok: true; ids: string[] }
  | { ok: false; causa: CausaBloqueio; detalhe: string };

const DIFICULDADES: DificuldadeSorteio[] = ["facil", "media", "dificil"];

/** Classificação pedagógica da questão, a partir do metadado. */
export function tipoPedagogico(q: Pick<QuestaoSorteavel, "tipologia" | "cenario">): TipoPedagogico {
  return q.cenario ? "cenario" : q.tipologia;
}

/** Gerador determinístico simples (mulberry32), para testes repetíveis. */
export function geradorComSemente(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baralhar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    const a = copia[i] as T;
    copia[i] = copia[j] as T;
    copia[j] = a;
  }
  return copia;
}

type Celula = {
  modulo: string;
  tipo: TipoPedagogico;
  dificuldade: DificuldadeSorteio;
  questoes: QuestaoSorteavel[];
};

/** Distribui um total por várias chaves, proporcionalmente, com mínimo de 1. */
export function quotasProporcionais(
  disponivelPorChave: Record<string, number>,
  total: number,
): Record<string, number> {
  const chaves = Object.keys(disponivelPorChave).filter((k) => (disponivelPorChave[k] ?? 0) > 0);
  const quotas: Record<string, number> = {};
  if (chaves.length === 0 || total <= 0) return quotas;
  const soma = chaves.reduce((s, k) => s + (disponivelPorChave[k] ?? 0), 0);
  let atribuido = 0;
  for (const k of chaves) {
    const parte = Math.max(1, Math.floor((total * (disponivelPorChave[k] ?? 0)) / soma));
    quotas[k] = parte;
    atribuido += parte;
  }
  // Acerto final, sem passar do que existe.
  let i = 0;
  while (atribuido !== total && i < 1000) {
    const k = chaves[i % chaves.length] as string;
    if (atribuido < total && (quotas[k] ?? 0) < (disponivelPorChave[k] ?? 0)) {
      quotas[k] = (quotas[k] ?? 0) + 1;
      atribuido++;
    } else if (atribuido > total && (quotas[k] ?? 0) > 1) {
      quotas[k] = (quotas[k] ?? 0) - 1;
      atribuido--;
    }
    i++;
  }
  return quotas;
}

const LIMITE_TRABALHO = 200_000;

/**
 * Sorteia as questões do exame respeitando, em simultâneo, as quotas de
 * módulo, de tipo pedagógico e de dificuldade.
 */
export function sortearExame(
  questoes: QuestaoSorteavel[],
  quotas: QuotasExame,
  aleatorio: () => number = Math.random,
): ResultadoSorteio {
  const somaModulos = Object.values(quotas.modulos).reduce((s, n) => s + n, 0);
  const somaTipos = Object.values(quotas.tipos).reduce<number>((s, n) => s + (n ?? 0), 0);
  const somaDif = DIFICULDADES.reduce((s, d) => s + (quotas.dificuldade[d] ?? 0), 0);
  if (somaModulos !== quotas.total || somaTipos !== quotas.total || somaDif !== quotas.total) {
    return {
      ok: false,
      causa: "QUOTAS_INCOERENTES",
      detalhe: `As quotas não somam ${quotas.total}: módulos ${somaModulos}, tipos ${somaTipos}, dificuldades ${somaDif}.`,
    };
  }

  // Agrupar por célula (módulo × tipo × dificuldade).
  const celulas = new Map<string, Celula>();
  for (const q of questoes) {
    const modulo = q.moduloId ?? "";
    if (!(modulo in quotas.modulos)) continue; // módulo fora do exame
    const tipo = tipoPedagogico(q);
    if (!(tipo in quotas.tipos)) continue; // tipo não pedido
    const chave = `${modulo}||${tipo}||${q.dificuldade}`;
    const existente = celulas.get(chave);
    if (existente) existente.questoes.push(q);
    else celulas.set(chave, { modulo, tipo, dificuldade: q.dificuldade, questoes: [q] });
  }

  // Verificações de existência, com causa clara.
  for (const [modulo, exigidas] of Object.entries(quotas.modulos)) {
    if (exigidas <= 0) continue;
    const existem = [...celulas.values()]
      .filter((c) => c.modulo === modulo)
      .reduce((s, c) => s + c.questoes.length, 0);
    if (existem < exigidas)
      return {
        ok: false,
        causa: "MODULO_SEM_QUESTOES",
        detalhe: `O módulo ${modulo} precisa de ${exigidas} questões utilizáveis e só tem ${existem}.`,
      };
  }
  for (const [tipo, exigidas] of Object.entries(quotas.tipos)) {
    if (!exigidas) continue;
    const existem = [...celulas.values()]
      .filter((c) => c.tipo === tipo)
      .reduce((s, c) => s + c.questoes.length, 0);
    if (existem < exigidas)
      return {
        ok: false,
        causa: "TIPO_SEM_QUESTOES",
        detalhe: `O tipo ${tipo} precisa de ${exigidas} questões utilizáveis e só tem ${existem}.`,
      };
  }
  for (const d of DIFICULDADES) {
    const exigidas = quotas.dificuldade[d] ?? 0;
    if (exigidas <= 0) continue;
    const existem = [...celulas.values()]
      .filter((c) => c.dificuldade === d)
      .reduce((s, c) => s + c.questoes.length, 0);
    if (existem < exigidas)
      return {
        ok: false,
        causa: "DIFICULDADE_SEM_QUESTOES",
        detalhe: `A dificuldade ${d} precisa de ${exigidas} questões utilizáveis e só tem ${existem}.`,
      };
  }

  // Ordem de exploração: primeiro as células mais escassas (menos questões
  // disponíveis), com desempate ao acaso. A ordem não retira soluções — o
  // retrocesso continua a percorrer todo o espaço — mas reduz muito o
  // trabalho, porque as decisões mais condicionadas são tomadas cedo.
  const lista = baralhar([...celulas.values()], aleatorio).sort(
    (a, b) => a.questoes.length - b.questoes.length,
  );

  // Sobras por restrição, a partir de cada posição (para podar cedo).
  const n = lista.length;
  const sobraModulo: Record<string, number>[] = new Array(n + 1);
  const sobraTipo: Record<string, number>[] = new Array(n + 1);
  const sobraDif: Record<string, number>[] = new Array(n + 1);
  sobraModulo[n] = {};
  sobraTipo[n] = {};
  sobraDif[n] = {};
  for (let i = n - 1; i >= 0; i--) {
    const c = lista[i] as Celula;
    const qtd = c.questoes.length;
    sobraModulo[i] = { ...(sobraModulo[i + 1] as Record<string, number>) };
    sobraTipo[i] = { ...(sobraTipo[i + 1] as Record<string, number>) };
    sobraDif[i] = { ...(sobraDif[i + 1] as Record<string, number>) };
    (sobraModulo[i] as Record<string, number>)[c.modulo] =
      ((sobraModulo[i] as Record<string, number>)[c.modulo] ?? 0) + qtd;
    (sobraTipo[i] as Record<string, number>)[c.tipo] =
      ((sobraTipo[i] as Record<string, number>)[c.tipo] ?? 0) + qtd;
    (sobraDif[i] as Record<string, number>)[c.dificuldade] =
      ((sobraDif[i] as Record<string, number>)[c.dificuldade] ?? 0) + qtd;
  }

  const faltaModulo: Record<string, number> = { ...quotas.modulos };
  const faltaTipo: Record<string, number> = {};
  for (const [t, v] of Object.entries(quotas.tipos)) faltaTipo[t] = v ?? 0;
  const faltaDif: Record<string, number> = {
    facil: quotas.dificuldade.facil,
    media: quotas.dificuldade.media,
    dificil: quotas.dificuldade.dificil,
  };

  const escolhidas: number[] = new Array(n).fill(0);
  let trabalho = 0;
  let esgotou = false;

  function viavel(i: number): boolean {
    const sm = sobraModulo[i] as Record<string, number>;
    const st = sobraTipo[i] as Record<string, number>;
    const sd = sobraDif[i] as Record<string, number>;
    for (const [k, v] of Object.entries(faltaModulo)) if (v > (sm[k] ?? 0)) return false;
    for (const [k, v] of Object.entries(faltaTipo)) if (v > (st[k] ?? 0)) return false;
    for (const [k, v] of Object.entries(faltaDif)) if (v > (sd[k] ?? 0)) return false;
    return true;
  }

  function resolver(i: number): boolean {
    if (++trabalho > LIMITE_TRABALHO) {
      esgotou = true;
      return false;
    }
    if (i === n) {
      return (
        Object.values(faltaModulo).every((v) => v === 0) &&
        Object.values(faltaTipo).every((v) => v === 0) &&
        Object.values(faltaDif).every((v) => v === 0)
      );
    }
    if (!viavel(i)) return false;
    const c = lista[i] as Celula;
    const maximo = Math.min(
      c.questoes.length,
      faltaModulo[c.modulo] ?? 0,
      faltaTipo[c.tipo] ?? 0,
      faltaDif[c.dificuldade] ?? 0,
    );
    const valores = baralhar(
      Array.from({ length: maximo + 1 }, (_, k) => k),
      aleatorio,
    );
    for (const v of valores) {
      escolhidas[i] = v;
      if (v > 0) {
        (faltaModulo[c.modulo] as number) -= v;
        (faltaTipo[c.tipo] as number) -= v;
        (faltaDif[c.dificuldade] as number) -= v;
      }
      const bom = resolver(i + 1);
      if (v > 0) {
        (faltaModulo[c.modulo] as number) += v;
        (faltaTipo[c.tipo] as number) += v;
        (faltaDif[c.dificuldade] as number) += v;
      }
      if (bom) return true;
      if (esgotou) return false;
    }
    escolhidas[i] = 0;
    return false;
  }

  const encontrou = resolver(0);
  if (!encontrou) {
    if (esgotou)
      return {
        ok: false,
        causa: "LIMITE_DE_TRABALHO",
        detalhe:
          "O sorteio esgotou o limite de trabalho sem encontrar uma prova que cumprisse todas as quotas. A prova fica bloqueada.",
      };
    return {
      ok: false,
      causa: "COMBINACAO_IMPOSSIVEL",
      detalhe:
        "Existem questões suficientes em cada critério isolado, mas não há nenhuma combinação que cumpra em simultâneo as quotas de módulo, tipo e dificuldade.",
    };
  }

  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const quantas = escolhidas[i] as number;
    if (quantas <= 0) continue;
    const c = lista[i] as Celula;
    for (const q of baralhar(c.questoes, aleatorio).slice(0, quantas)) ids.push(q.id);
  }
  return { ok: true, ids: baralhar(ids, aleatorio) };
}
