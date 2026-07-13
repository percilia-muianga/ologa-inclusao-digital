import { z } from "zod";

export const PROVINCIAS = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane",
  "Manica",
  "Maputo Cidade",
  "Maputo Província",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambézia",
] as const;

export const NATUREZA_OPCOES = [
  ["orgao_central", "Órgão central"],
  ["direcao_provincial", "Direção provincial"],
  ["administracao_distrital", "Administração distrital"],
  ["autarquia", "Autarquia"],
  ["ong", "ONG"],
  ["empresa", "Empresa"],
  ["outro", "Outro"],
] as const;

export const SETOR_OPCOES = [
  ["admin_publica_central", "Administração pública central"],
  ["admin_local", "Administração local (distrital ou autárquica)"],
  ["educacao", "Educação"],
  ["saude", "Saúde"],
  ["financas", "Finanças"],
  ["justica", "Justiça"],
  ["agricultura", "Agricultura"],
  ["infraestruturas_transportes", "Infraestruturas e transportes"],
  ["energia", "Energia"],
  ["interior_seguranca", "Interior e segurança"],
  ["sociedade_civil_ong", "Sociedade civil / ONG"],
  ["setor_privado", "Setor privado"],
  ["outro", "Outro"],
] as const;

export const MEIO_OPCOES = [
  ["urbano", "Urbano"],
  ["peri_urbano", "Peri-urbano"],
  ["rural", "Rural"],
] as const;

export const MODALIDADE_OPCOES = [
  ["presencial", "Presencial"],
  ["virtual", "Virtual"],
  ["misto", "Misto"],
] as const;

export const CONECTIVIDADE_OPCOES = [
  ["boa", "Boa"],
  ["fraca", "Fraca"],
  ["nenhuma", "Nenhuma"],
] as const;

export const NIVEL_LITERACIA_OPCOES = [
  ["nenhum", "Nenhum"],
  ["basico", "Básico"],
  ["intermedio", "Intermédio"],
  ["prefere_nao_indicar", "Não sei ou misto"],
] as const;

export const APOIOS_OPCOES = [
  ["lsm", "Língua de Sinais Moçambicana"],
  ["leitura_facil", "Leitura fácil"],
  ["baixa_visao", "Baixa visão / letra ampliada"],
  ["audiodescricao", "Áudio / audiodescrição"],
  ["mobilidade", "Mobilidade / sala acessível"],
  ["nenhum", "Nenhum apoio específico"],
] as const;

export const PERCURSO_OPCOES = [
  ["completo", "Percurso completo (os três níveis)"],
  ["fundacao", "Fundação (Básico)"],
  ["intermedio", "Intermédio"],
  ["avancado", "Avançado"],
  ["avulsos", "Módulos avulsos (selecionar na lista de módulos)"],
] as const;

export const SALA_OPCOES = [
  ["sim", "Sim"],
  ["nao", "Não"],
  ["nao_sei", "Não sei"],
] as const;

export const CONSENTIMENTO_TEXTO =
  "Autorizo a Ologa Sistemas Informáticos, Lda. a tratar os dados desta inscrição para efeitos de planeamento e realização da formação. Os dados são usados apenas para esse fim e não são partilhados com terceiros. A instituição pode, a qualquer momento, pedir o acesso, a correção ou a eliminação dos seus dados.";

export function rotulo<T extends readonly (readonly [string, string])[]>(
  opcoes: T,
  valor: string | null | undefined,
): string {
  if (!valor) return "—";
  const found = opcoes.find(([v]) => v === valor);
  return found ? found[1] : valor;
}

export function rotulosLista<T extends readonly (readonly [string, string])[]>(
  opcoes: T,
  valores: readonly string[] | null | undefined,
): string {
  if (!valores || valores.length === 0) return "—";
  return valores.map((v) => rotulo(opcoes, v)).join(", ");
}

// ---- Zod schema partilhado (cliente + servidor) ----

const natureza = z.enum([
  "orgao_central",
  "direcao_provincial",
  "administracao_distrital",
  "autarquia",
  "ong",
  "empresa",
  "outro",
]);
const setor = z.enum([
  "admin_publica_central",
  "admin_local",
  "educacao",
  "saude",
  "financas",
  "justica",
  "agricultura",
  "infraestruturas_transportes",
  "energia",
  "interior_seguranca",
  "sociedade_civil_ong",
  "setor_privado",
  "outro",
]);
const meio = z.enum(["urbano", "peri_urbano", "rural"]);
const modalidade = z.enum(["presencial", "virtual", "misto"]);
const conectividade = z.enum(["boa", "fraca", "nenhuma"]);
const nivelLiteracia = z.enum([
  "nenhum",
  "basico",
  "intermedio",
  "prefere_nao_indicar",
]);
const apoio = z.enum([
  "lsm",
  "leitura_facil",
  "baixa_visao",
  "audiodescricao",
  "mobilidade",
  "nenhum",
]);
const percurso = z.enum([
  "completo",
  "fundacao",
  "intermedio",
  "avancado",
  "avulsos",
]);
const prazo = z.enum([
  "breve",
  "entre_1_3_meses",
  "entre_3_6_meses",
  "mais_6_meses",
  "nao_definido",
]);
const sala = z.enum(["sim", "nao", "nao_sei"]);
const provincia = z.enum(PROVINCIAS as unknown as [string, ...string[]]);

const baseInstituicaoObject = z.object({
  nome: z.string().trim().min(1, "Indique o nome da instituição.").max(200),
  natureza,
  setor,
  setor_outro: z.string().trim().max(200).nullable().optional(),
  ponto_focal_nome: z.string().trim().max(200).nullable().optional(),
  ponto_focal_email: z
    .string()
    .trim()
    .email("Email inválido.")
    .max(200)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  provincia: provincia.nullable().optional(),
  distrito: z.string().trim().max(200).nullable().optional(),
  meio: meio.nullable().optional(),
  modalidade: modalidade.nullable().optional(),
  conectividade: conectividade.nullable().optional(),
  num_computadores: z.number().int().min(0).nullable().optional(),
  num_colaboradores_total: z
    .number({ invalid_type_error: "Indique o número total de colaboradores." })
    .int()
    .min(1, "Deve ser pelo menos 1."),
  nivel_literacia: nivelLiteracia.nullable().optional(),
  num_mulheres: z.number().int().min(0).nullable().optional(),
  num_homens: z.number().int().min(0).nullable().optional(),
  num_pcd: z.number().int().min(0).nullable().optional(),
  apoios_acessibilidade: z.array(apoio).max(10).nullable().optional(),
  modulos_interesse: z.array(z.string().uuid()).max(500).nullable().optional(),
  percurso: percurso.nullable().optional(),
  prazo: prazo.nullable().optional(),
  sala_disponivel: sala.nullable().optional(),
  observacoes: z.string().trim().max(5000).nullable().optional(),
});

export const baseInstituicaoSchema = baseInstituicaoObject.superRefine((d, ctx) => {
  if (d.setor === "outro" && (!d.setor_outro || d.setor_outro.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["setor_outro"],
      message: "Especifique o setor.",
    });
  }
});

export const inscricaoPublicaSchema = baseInstituicaoObject
  .extend({ consentimento: z.literal(true) })
  .superRefine((d, ctx) => {
    if (d.setor === "outro" && (!d.setor_outro || d.setor_outro.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["setor_outro"],
        message: "Especifique o setor.",
      });
    }
  });

export type DadosInstituicao = z.infer<typeof baseInstituicaoSchema>;
export type DadosInscricaoPublica = z.infer<typeof inscricaoPublicaSchema>;
