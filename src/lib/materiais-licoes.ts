/** Regras partilhadas (cliente e servidor) para materiais das lições. */
export const BUCKET_MATERIAIS = "materiais-licoes";
export const TAMANHO_MAX_BYTES = 50 * 1024 * 1024;

export type TipoMaterial = "pdf" | "apresentacao" | "video" | "legenda";

export const TIPOS: Record<TipoMaterial, { rotulo: string; extensoes: string[]; mimes: Record<string, string> }> = {
  pdf: { rotulo: "PDF", extensoes: ["pdf"], mimes: { pdf: "application/pdf" } },
  apresentacao: {
    rotulo: "Apresentação",
    extensoes: ["pptx", "ppt", "odp", "pdf"],
    mimes: {
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ppt: "application/vnd.ms-powerpoint",
      odp: "application/vnd.oasis.opendocument.presentation",
      pdf: "application/pdf",
    },
  },
  video: { rotulo: "Vídeo", extensoes: ["mp4", "webm"], mimes: { mp4: "video/mp4", webm: "video/webm" } },
  legenda: { rotulo: "Legenda (WebVTT)", extensoes: ["vtt"], mimes: { vtt: "text/vtt" } },
};

export function extensao(nome: string) {
  const i = nome.lastIndexOf(".");
  return i < 0 ? "" : nome.slice(i + 1).toLowerCase();
}

/** Devolve o tipo MIME normalizado ou uma mensagem de erro legível. */
export function validarFicheiro(tipo: TipoMaterial, nome: string, tamanho: number): { mime: string } | { erro: string } {
  const ext = extensao(nome);
  const t = TIPOS[tipo];
  if (!t.extensoes.includes(ext)) return { erro: `Formato não aceite para ${t.rotulo}. Aceites: ${t.extensoes.join(", ")}.` };
  if (tamanho <= 0) return { erro: "O ficheiro está vazio." };
  if (tamanho > TAMANHO_MAX_BYTES) return { erro: "O ficheiro excede 50 MB." };
  return { mime: t.mimes[ext]! };
}

export type AvisoMaterial = "ficheiro_em_falta" | "sem_descricao" | "video_sem_legenda" | "legenda_sem_video" | "indisponivel";

export const TEXTO_AVISO: Record<AvisoMaterial, string> = {
  ficheiro_em_falta: "Ficheiro em falta no armazenamento — não pode ser disponibilizado.",
  sem_descricao: "Falta a descrição acessível (texto alternativo para quem não vê ou não pode abrir o ficheiro).",
  video_sem_legenda: "Vídeo sem legenda disponível associada.",
  legenda_sem_video: "Legenda não associada a nenhum vídeo.",
  indisponivel: "Não disponibilizado aos formandos.",
};

type M = { id: string; tipo: TipoMaterial; disponivel: boolean; descricao_acessivel: string | null; legenda_de: string | null; existe: boolean };

export function avisosMaterial(m: M, todos: M[]): AvisoMaterial[] {
  const a: AvisoMaterial[] = [];
  if (!m.existe) a.push("ficheiro_em_falta");
  if (!m.disponivel) a.push("indisponivel");
  if (m.tipo !== "legenda" && !m.descricao_acessivel?.trim()) a.push("sem_descricao");
  if (m.tipo === "video" && !todos.some((x) => x.tipo === "legenda" && x.legenda_de === m.id && x.disponivel && x.existe))
    a.push("video_sem_legenda");
  if (m.tipo === "legenda" && !todos.some((x) => x.id === m.legenda_de && x.tipo === "video")) a.push("legenda_sem_video");
  return a;
}

/** Nova ordem após mover um item uma posição (−1 cima, +1 baixo). */
export function mover(ids: string[], id: string, dir: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const r = [...ids];
  [r[i], r[j]] = [r[j]!, r[i]!];
  return r;
}
